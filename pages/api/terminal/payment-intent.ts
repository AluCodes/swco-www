import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { logError, logInfo, logSuccess } from '@/lib/api-logger';
import { STRIPE_API_VERSION } from '@/lib/constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: STRIPE_API_VERSION,
});

type PaymentIntentResponse = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
  charges?: any[];
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentIntentResponse | ErrorResponse>
) {
  // Handle GET - Retrieve Payment Intent Status
  if (req.method === 'GET') {
    try {
      await logInfo('Payment Intent API: GET request received');
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        await logError('Payment Intent API: Missing payment intent id in GET');
        return res.status(400).json({ error: 'Payment Intent ID is required' });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(id);

      await logSuccess('Payment Intent API: Retrieved payment intent', paymentIntent);

      res.status(200).json(paymentIntent);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await logError('Payment Intent API: Failed to retrieve payment intent', { error: message });
      res.status(500).json({ error: `Failed to retrieve payment intent: ${message}` });
    }
    return;
  }

  // Handle POST - Create Payment Intent
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await logInfo('Payment Intent API: POST request received');
    const { amount, currency, description, metadata } = req.body;

    if (!amount || typeof amount !== 'number') {
      await logError('Payment Intent API: Invalid amount in POST', { amount });
      return res.status(400).json({ error: 'Amount is required and must be a number' });
    }

    // before creating payment intent, search for existing payment intent with status: requires_confirmation
    /*
    const existingPaymentIntent = await stripe.paymentIntents.search({
      query: `status:'requires_confirmation'`,
    });
    console.log('existingPaymentIntent', existingPaymentIntent);
    */

    //call server side api to get existing payment intent
    const existingPaymentIntentResponse = await fetch(`${process.env.API_BASE_URL}/share-and-work-get-payment-intent`);
    const existingPaymentIntentData = await existingPaymentIntentResponse.json();
    await logInfo('Payment Intent API: Existing PI lookup complete', { count: existingPaymentIntentData?.data?.length || 0 });

    if (existingPaymentIntentData.data.length > 0) {
      await logInfo('Payment Intent API: Updating existing payment intent', { id: existingPaymentIntentData.data[0].id });
      
      // update the existing payment intent
      const updatedPaymentIntent = await stripe.paymentIntents.update(existingPaymentIntentData.data[0].id, {
        amount: Math.round(amount),
        currency: currency.toLowerCase(),
        payment_method_types: ['card_present'],
        capture_method: 'automatic',
        description: description || 'Terminal Payment',
        metadata: metadata || {},
        statement_descriptor: 'Share',
        statement_descriptor_suffix: 'Work'
      });
      await logSuccess('Payment Intent API: Updated payment intent', { id: updatedPaymentIntent.id, status: updatedPaymentIntent.status });
      // update database with the updated payment intent
      const db_intent_response = await fetch(`${process.env.API_BASE_URL}/share-and-work-update-payment-intent`, {
        method: 'PUT',
        body: JSON.stringify(updatedPaymentIntent),
      });

      res.status(200).json({
        id: updatedPaymentIntent.id,
        amount: updatedPaymentIntent.amount,
        currency: updatedPaymentIntent.currency,
        status: updatedPaymentIntent.status,
        client_secret: updatedPaymentIntent.client_secret || '',
      });
    } 
    else{
      // create a new payment intent
      await logInfo('Payment Intent API: Creating new payment intent');
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: currency.toLowerCase(),
        payment_method_types: ['card_present'],
        capture_method: 'automatic',
        description: description || 'Terminal Payment',
        metadata: metadata || {},
        statement_descriptor: 'Share',
        statement_descriptor_suffix: 'Work'
      });

      const db_add_intent_response = await fetch(`${process.env.API_BASE_URL}/share-and-work-add-payment-intent`, {
        method: 'POST',
        body: JSON.stringify(paymentIntent),
      });

      await logSuccess('Payment Intent API: Created payment intent', { id: paymentIntent.id, status: paymentIntent.status });

      res.status(200).json({
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret || '',
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logError('Payment Intent API: Failed to create/update payment intent', { error: message });
    res.status(500).json({ error: `Failed to create payment intent: ${message}` });
  }
}

