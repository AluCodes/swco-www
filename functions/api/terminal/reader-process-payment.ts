import type { Env } from '../../_lib/env.d';
import { logError } from '../../_lib/logger';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let readerId: string | undefined;
  let paymentIntentId: string | undefined;

  try {
    ({ readerId, paymentIntentId } = await request.json() as {
      readerId?: string;
      paymentIntentId?: string;
    });

    if (!readerId || typeof readerId !== 'string') {
      return Response.json({ error: 'Reader ID is required' }, { status: 400 });
    }

    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return Response.json({ error: 'Payment Intent ID is required' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.stripe.com/v1/terminal/readers/${readerId}/process_payment_intent`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          payment_intent: paymentIntentId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json() as { error?: { message?: string } };
      throw new Error(errorData.error?.message || 'Failed to process payment on reader');
    }

    const reader = await response.json();

    return Response.json({
      success: true,
      reader,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    await logError(env, 'Failed to process payment on reader', {
      error: errorMessage,
      stack: errorStack,
      readerId,
      paymentIntentId,
      endpoint: '/api/terminal/reader-process-payment',
    });

    return Response.json({ error: `Failed to process payment on reader: ${errorMessage}` }, { status: 500 });
  }
};
