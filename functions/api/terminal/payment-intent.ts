import type { Env } from '../../_lib/env.d';
import { getStripe } from '../../_lib/stripe';
import { logError, logInfo, logSuccess } from '../../_lib/logger';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const stripe = getStripe(env);

  try {
    await logInfo(env, 'Payment Intent API: GET request received');
    const id = new URL(request.url).searchParams.get('id');

    if (!id) {
      await logError(env, 'Payment Intent API: Missing payment intent id in GET');
      return Response.json({ error: 'Payment Intent ID is required' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(id);

    await logSuccess(env, 'Payment Intent API: Retrieved payment intent', paymentIntent);

    return Response.json(paymentIntent);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logError(env, 'Payment Intent API: Failed to retrieve payment intent', { error: message });
    return Response.json({ error: `Failed to retrieve payment intent: ${message}` }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const stripe = getStripe(env);

  try {
    await logInfo(env, 'Payment Intent API: POST request received');
    const { amount, currency, description, metadata } = await request.json() as {
      amount: number;
      currency: string;
      description?: string;
      metadata?: Record<string, string>;
    };

    if (!amount || typeof amount !== 'number') {
      await logError(env, 'Payment Intent API: Invalid amount in POST', { amount });
      return Response.json({ error: 'Amount is required and must be a number' }, { status: 400 });
    }

    // call server side api to get existing payment intent
    const existingPaymentIntentResponse = await fetch(`${env.API_BASE_URL}/share-and-work-get-payment-intent`);
    const existingPaymentIntentData = await existingPaymentIntentResponse.json() as { data: Array<{ id: string }> };
    await logInfo(env, 'Payment Intent API: Existing PI lookup complete', { count: existingPaymentIntentData?.data?.length || 0 });

    if (existingPaymentIntentData.data.length > 0) {
      await logInfo(env, 'Payment Intent API: Updating existing payment intent', { id: existingPaymentIntentData.data[0].id });

      const updatedPaymentIntent = await stripe.paymentIntents.update(existingPaymentIntentData.data[0].id, {
        amount: Math.round(amount),
        currency: currency.toLowerCase(),
        payment_method_types: ['card_present'],
        capture_method: 'automatic',
        description: description || 'Terminal Payment',
        metadata: metadata || {},
        statement_descriptor: 'Share',
        statement_descriptor_suffix: 'Work',
      });
      await logSuccess(env, 'Payment Intent API: Updated payment intent', { id: updatedPaymentIntent.id, status: updatedPaymentIntent.status });

      // update database with the updated payment intent
      await fetch(`${env.API_BASE_URL}/share-and-work-update-payment-intent`, {
        method: 'PUT',
        body: JSON.stringify(updatedPaymentIntent),
      });

      return Response.json({
        id: updatedPaymentIntent.id,
        amount: updatedPaymentIntent.amount,
        currency: updatedPaymentIntent.currency,
        status: updatedPaymentIntent.status,
        client_secret: updatedPaymentIntent.client_secret || '',
      });
    } else {
      await logInfo(env, 'Payment Intent API: Creating new payment intent');
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: currency.toLowerCase(),
        payment_method_types: ['card_present'],
        capture_method: 'automatic',
        description: description || 'Terminal Payment',
        metadata: metadata || {},
        statement_descriptor: 'Share',
        statement_descriptor_suffix: 'Work',
      });

      await fetch(`${env.API_BASE_URL}/share-and-work-add-payment-intent`, {
        method: 'POST',
        body: JSON.stringify(paymentIntent),
      });

      await logSuccess(env, 'Payment Intent API: Created payment intent', { id: paymentIntent.id, status: paymentIntent.status });

      return Response.json({
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret || '',
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logError(env, 'Payment Intent API: Failed to create/update payment intent', { error: message });
    return Response.json({ error: `Failed to create payment intent: ${message}` }, { status: 500 });
  }
};
