import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import crypto from 'crypto';
import { logError, logInfo, logSuccess } from '@/lib/api-logger';
import { STRIPE_API_VERSION } from '@/lib/constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: STRIPE_API_VERSION,
});

// Generate hourly hash for automatic key rotation
function generateHourlyHash(secret: string): string {
  const now = new Date();
  const dateHour = `${now.toISOString().split('T')[0]}-${now.getUTCHours()}`;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(dateHour)
    .digest('hex');
  return hash;
}

type BalanceTransaction = {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  fee: number;
  net: number;
  status: string;
  type: string;
  created: number;
  available_on: number;
  source?: string;
};

type SummaryResponse = {
  payout?: {
    id: string;
    amount: number;
    currency: string;
    arrival_date: number;
    status: string;
    type: string;
    method: string;
    created: number;
    description: string | null;
  };
  balance?: {
    available: Stripe.Balance.Available[];
    pending: Stripe.Balance.Pending[];
  };
  transactions: BalanceTransaction[];
  summary: {
    total_amount: number;
    total_fees: number;
    total_net: number;
    transaction_count: number;
  };
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SummaryResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    await logError('Payout Summary API: Invalid method', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: Check origin/referer to ensure request comes from our domain
  const origin = req.headers.origin as string | undefined;
  const referer = req.headers.referer as string | undefined;
  const host = req.headers.host as string | undefined;

  // Get allowed hosts from environment or use current host
  const allowedHosts = process.env.ALLOWED_HOSTS 
    ? process.env.ALLOWED_HOSTS.split(',').map(h => h.trim())
    : [];
  
  // Add current host if available
  if (host) {
    allowedHosts.push(host);
  }
  
  // Add common localhost variations for development
  allowedHosts.push('localhost:3000', 'localhost', '127.0.0.1:3000', '127.0.0.1');

  // Check if request comes from allowed origin
  let isValidOrigin = false;
  
  if (origin) {
    isValidOrigin = allowedHosts.some(allowedHost => 
      origin.includes(allowedHost)
    );
  } else if (referer) {
    isValidOrigin = allowedHosts.some(allowedHost => 
      referer.includes(allowedHost)
    );
  } else {
    // If no origin or referer, allow only if called server-side (e.g., from getServerSideProps)
    // In this case, there's no origin/referer header
    isValidOrigin = !req.headers['user-agent']?.includes('Mozilla');
  }

  if (!isValidOrigin) {
    await logError('Payout Summary API: Invalid origin/referer', {
      origin,
      referer,
      host,
      userAgent: req.headers['user-agent'],
    });
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Security: Verify hourly hash (second layer of defense)
  const providedHash = req.headers['x-api-key'] || req.headers['x-internal-key'];
  const secretSalt = process.env.NEXT_PUBLIC_INTERNAL_API_KEY;

  if (!secretSalt) {
    await logError('Payout Summary API: SECRET_SALT not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const expectedHash = generateHourlyHash(secretSalt);

  if (!providedHash || providedHash !== expectedHash) {
    await logError('Payout Summary API: Unauthorized access attempt - Invalid or expired hash', {
      hasHash: !!providedHash,
      origin,
      referer,
      userAgent: req.headers['user-agent'],
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await logInfo('Payout Summary API: GET request received');

    // Get query parameters for filtering
    const { limit = '100', type, starting_after, ending_before, po_id } = req.query;

    let payoutDetails;
    let balance;
    
    // If po_id is provided, fetch payout details and filter transactions
    if (po_id && typeof po_id === 'string') {
      await logInfo('Payout Summary API: Fetching payout details', { po_id });
      
      // Retrieve the specific payout
      const payout = await stripe.payouts.retrieve(po_id);
      
      payoutDetails = {
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        arrival_date: payout.arrival_date,
        status: payout.status,
        type: payout.type,
        method: payout.method,
        created: payout.created,
        description: payout.description,
      };

      await logSuccess('Payout Summary API: Retrieved payout details', payoutDetails);
    } else {
      // If no po_id, fetch current balance
      await logInfo('Payout Summary API: Fetching balance');
      balance = await stripe.balance.retrieve();
    }

    // Build query parameters for balance transactions
    const listParams: any = {
      limit: parseInt(limit as string),
    };

    // If po_id is provided, filter transactions by payout
    if (po_id && typeof po_id === 'string') {
      listParams.payout = po_id;
    }

    if (type && typeof type === 'string') {
      listParams.type = type;
    }

    if (starting_after && typeof starting_after === 'string') {
      listParams.starting_after = starting_after;
    }

    if (ending_before && typeof ending_before === 'string') {
      listParams.ending_before = ending_before;
    }

    // Fetch balance transactions
    await logInfo('Payout Summary API: Fetching balance transactions', { params: listParams });
    const balanceTransactions = await stripe.balanceTransactions.list(listParams);

    // Transform transactions to simpler format
    const transactions: BalanceTransaction[] = balanceTransactions.data.map((txn) => ({
      id: txn.id,
      amount: txn.amount,
      currency: txn.currency,
      description: txn.description,
      fee: txn.fee,
      net: txn.net,
      status: txn.status,
      type: txn.type,
      created: txn.created,
      available_on: txn.available_on,
      source: typeof txn.source === 'string' ? txn.source : txn.source?.id,
    }));

    // Calculate summary statistics
    const summary = {
      total_amount: transactions.reduce((sum, txn) => sum + txn.amount, 0),
      total_fees: transactions.reduce((sum, txn) => sum + txn.fee, 0),
      total_net: transactions.reduce((sum, txn) => sum + txn.net, 0),
      transaction_count: transactions.length,
    };

    await logSuccess('Payout Summary API: Successfully retrieved transactions', {
      transaction_count: transactions.length,
      payout_id: po_id || 'none',
      has_balance: !!balance,
    });

    const response: SummaryResponse = {
      transactions,
      summary,
    };

    // Add payout details if po_id was provided
    if (payoutDetails) {
      response.payout = payoutDetails;
    }

    // Add balance if no po_id was provided
    if (balance) {
      response.balance = {
        available: balance.available,
        pending: balance.pending,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logError('Payout Summary API: Failed to fetch balance transactions', { error: message });
    res.status(500).json({ error: `Failed to fetch payout summary: ${message}` });
  }
}

