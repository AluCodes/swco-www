import Stripe from 'stripe';
import type { Env } from '../../_lib/env.d';
import { getStripe } from '../../_lib/stripe';
import { logError, logInfo, logSuccess } from '../../_lib/logger';
import { generateHourlyHash } from '../../_lib/payout-auth';

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

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const stripe = getStripe(env);
  const url = new URL(request.url);

  // Security: Check origin/referer to ensure request comes from our domain
  const origin = request.headers.get('origin') || undefined;
  const referer = request.headers.get('referer') || undefined;
  const host = request.headers.get('host') || undefined;

  const allowedHosts = env.ALLOWED_HOSTS
    ? env.ALLOWED_HOSTS.split(',').map((h) => h.trim())
    : [];

  if (host) {
    allowedHosts.push(host);
  }

  allowedHosts.push('localhost:3000', 'localhost', '127.0.0.1:3000', '127.0.0.1');

  let isValidOrigin = false;

  if (origin) {
    isValidOrigin = allowedHosts.some((allowedHost) => origin.includes(allowedHost));
  } else if (referer) {
    isValidOrigin = allowedHosts.some((allowedHost) => referer.includes(allowedHost));
  } else {
    const userAgent = request.headers.get('user-agent') || '';
    isValidOrigin = !userAgent.includes('Mozilla');
  }

  if (!isValidOrigin) {
    await logError(env, 'Payout Summary API: Invalid origin/referer', {
      origin,
      referer,
      host,
      userAgent: request.headers.get('user-agent'),
    });
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Security: Verify hourly hash (second layer of defense)
  const providedHash = request.headers.get('x-api-key') || request.headers.get('x-internal-key');
  const secretSalt = env.INTERNAL_API_KEY;

  if (!secretSalt) {
    await logError(env, 'Payout Summary API: INTERNAL_API_KEY not configured');
    return Response.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const expectedHash = generateHourlyHash(secretSalt);

  if (!providedHash || providedHash !== expectedHash) {
    await logError(env, 'Payout Summary API: Unauthorized access attempt - Invalid or expired hash', {
      hasHash: !!providedHash,
      origin,
      referer,
      userAgent: request.headers.get('user-agent'),
    });
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await logInfo(env, 'Payout Summary API: GET request received');

    const limit = url.searchParams.get('limit') || '100';
    const type = url.searchParams.get('type');
    const starting_after = url.searchParams.get('starting_after');
    const ending_before = url.searchParams.get('ending_before');
    const po_id = url.searchParams.get('po_id');

    let payoutDetails;
    let balance;

    if (po_id) {
      await logInfo(env, 'Payout Summary API: Fetching payout details', { po_id });

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

      await logSuccess(env, 'Payout Summary API: Retrieved payout details', payoutDetails);
    } else {
      await logInfo(env, 'Payout Summary API: Fetching balance');
      balance = await stripe.balance.retrieve();
    }

    const listParams: Stripe.BalanceTransactionListParams = {
      limit: parseInt(limit, 10),
    };

    if (po_id) {
      listParams.payout = po_id;
    }

    if (type) {
      listParams.type = type;
    }

    if (starting_after) {
      listParams.starting_after = starting_after;
    }

    if (ending_before) {
      listParams.ending_before = ending_before;
    }

    await logInfo(env, 'Payout Summary API: Fetching balance transactions', { params: listParams });
    const balanceTransactions = await stripe.balanceTransactions.list(listParams);

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

    const summary = {
      total_amount: transactions.reduce((sum, txn) => sum + txn.amount, 0),
      total_fees: transactions.reduce((sum, txn) => sum + txn.fee, 0),
      total_net: transactions.reduce((sum, txn) => sum + txn.net, 0),
      transaction_count: transactions.length,
    };

    await logSuccess(env, 'Payout Summary API: Successfully retrieved transactions', {
      transaction_count: transactions.length,
      payout_id: po_id || 'none',
      has_balance: !!balance,
    });

    const response: Record<string, unknown> = { transactions, summary };

    if (payoutDetails) {
      response.payout = payoutDetails;
    }

    if (balance) {
      response.balance = {
        available: balance.available,
        pending: balance.pending,
      };
    }

    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logError(env, 'Payout Summary API: Failed to fetch balance transactions', { error: message });
    return Response.json({ error: `Failed to fetch payout summary: ${message}` }, { status: 500 });
  }
};
