import type { Env } from '../../_lib/env.d';
import { getStripe } from '../../_lib/stripe';

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: {
    id: string;
    amount: number;
    currency: string;
  } | null;
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const stripe = getStripe(env);

  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
      limit: 100,
    });

    const productsWithPrices: Product[] = products.data.map((product) => {
      const defaultPrice = product.default_price;

      let priceInfo = null;
      if (defaultPrice && typeof defaultPrice === 'object') {
        priceInfo = {
          id: defaultPrice.id,
          amount: defaultPrice.unit_amount || 0,
          currency: defaultPrice.currency,
        };
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: priceInfo,
      };
    });

    productsWithPrices.sort((a, b) => {
      const amountA = a.price?.amount || 0;
      const amountB = b.price?.amount || 0;
      return amountA - amountB;
    });

    return Response.json({ products: productsWithPrices });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: `Failed to get products: ${message}` }, { status: 500 });
  }
};
