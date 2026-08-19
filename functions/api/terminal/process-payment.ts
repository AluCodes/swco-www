import type { Env } from '../../_lib/env.d';
import { getStripe } from '../../_lib/stripe';
import { logError, logSuccess } from '../../_lib/logger';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const stripe = getStripe(env);
  let paymentIntentId: string | undefined;

  try {
    ({ paymentIntentId } = await request.json() as { paymentIntentId?: string });

    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return Response.json({ error: 'Payment Intent ID is required' }, { status: 400 });
    }

    // Retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // If status is requires_confirmation, confirm it
    if (paymentIntent.status === 'requires_confirmation') {
      const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

      await logSuccess(env, 'Payment confirmed successfully', {
        paymentIntentId: confirmedPaymentIntent.id,
        status: confirmedPaymentIntent.status,
        amount: confirmedPaymentIntent.amount,
      });

      return Response.json({
        id: confirmedPaymentIntent.id,
        status: confirmedPaymentIntent.status,
        amount: confirmedPaymentIntent.amount,
        currency: confirmedPaymentIntent.currency,
      });
    }

    // Payment intent is already in a different state, just return current status
    await logSuccess(env, 'Payment intent already processed', {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
    });

    return Response.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    await logError(env, 'Failed to process payment', {
      error: errorMessage,
      stack: errorStack,
      paymentIntentId,
      endpoint: '/api/terminal/process-payment',
    });

    return Response.json({ error: `Failed to process payment: ${errorMessage}` }, { status: 500 });
  }
};
