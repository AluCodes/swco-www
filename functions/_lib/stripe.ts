import Stripe from 'stripe';
import { STRIPE_API_VERSION } from '../../lib/constants';
import type { Env } from './env.d';

export function getStripe(env: Env): Stripe {
  return new Stripe(env.STRIPE_SECRET_KEY || '', {
    apiVersion: STRIPE_API_VERSION,
    httpClient: Stripe.createFetchHttpClient(),
  });
}
