import Stripe from 'stripe';
import { env } from './env';

// Instantiated even without a key so the app can boot in dev without Stripe
// configured; actual calls will fail clearly if STRIPE_SECRET_KEY is unset.
export const stripe = new Stripe(env.stripe.secretKey || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
});
