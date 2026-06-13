import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { logError, logSuccess } from '@/lib/api-logger';
import { STRIPE_API_VERSION } from '@/lib/constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: STRIPE_API_VERSION,
});

type ProcessPaymentResponse = {
  id: string;
  status: string;
  amount: number;
  currency: string;
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
    const { paymentIntentId } = req.body;

    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return res.status(400).json({ error: 'Payment Intent ID is required' });
    }

    console.log('Confirming payment intent:', paymentIntentId);

    // Retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // If status is requires_confirmation, confirm it
    if (paymentIntent.status === 'requires_confirmation') {
      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      
      await logSuccess('Payment confirmed successfully', {
        paymentIntentId: confirmedPaymentIntent.id,
        status: confirmedPaymentIntent.status,
        amount: confirmedPaymentIntent.amount,
      });

      res.status(200).json({
        id: confirmedPaymentIntent.id,
        status: confirmedPaymentIntent.status,
        amount: confirmedPaymentIntent.amount,
        currency: confirmedPaymentIntent.currency,
      });
    } else {
      // Payment intent is already in a different state, just return current status
      await logSuccess('Payment intent already processed', {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      });

      res.status(200).json({
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('Error processing payment:', errorMessage);
    
    await logError('Failed to process payment', {
      error: errorMessage,
      stack: errorStack,
      paymentIntentId: req.body.paymentIntentId,
      endpoint: '/api/terminal/process-payment',
    });
    
    res.status(500).json({ error: `Failed to process payment: ${errorMessage}` });
  }
}

