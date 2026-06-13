import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { logError } from '@/lib/api-logger';
import { STRIPE_API_VERSION } from '@/lib/constants'; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: STRIPE_API_VERSION,
});

type ProcessPaymentResponse = {
  success: boolean;
  reader?: any;
  error?: string;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProcessPaymentResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { readerId, paymentIntentId } = req.body;

    if (!readerId || typeof readerId !== 'string') {
      return res.status(400).json({ error: 'Reader ID is required' });
    }

    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return res.status(400).json({ error: 'Payment Intent ID is required' });
    }

    console.log('Processing payment on reader:', readerId);
    console.log('Payment Intent ID:', paymentIntentId);

    // Call Stripe API to process payment intent on the reader
    const response = await fetch(
      `https://api.stripe.com/v1/terminal/readers/${readerId}/process_payment_intent`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          payment_intent: paymentIntentId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to process payment on reader');
    }

    const reader = await response.json();

    res.status(200).json({
      success: true,
      reader: reader,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('Error processing payment on reader:', errorMessage);
    
    // Log error to centralized logging
    await logError('Failed to process payment on reader', {
      error: errorMessage,
      stack: errorStack,
      readerId: req.body.readerId,
      paymentIntentId: req.body.paymentIntentId,
      endpoint: '/api/terminal/reader-process-payment',
    });
    
    res.status(500).json({ error: `Failed to process payment on reader: ${errorMessage}` });
  }
}

