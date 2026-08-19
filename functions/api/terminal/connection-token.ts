import type { Env } from '../../_lib/env.d';
import { getStripe } from '../../_lib/stripe';

export const onRequestPost: PagesFunction<Env> = async ({ env }) => {
  const stripe = getStripe(env);

  try {
    const connectionToken = await stripe.terminal.connectionTokens.create();
    return Response.json({ secret: connectionToken.secret });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Failed to create connection token: ${message}` }, { status: 500 });
  }
};
