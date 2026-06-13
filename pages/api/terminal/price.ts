import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { STRIPE_API_VERSION } from '@/lib/constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: STRIPE_API_VERSION,
});

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

type ProductsResponse = {
  products: Product[];
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProductsResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch active products from Stripe
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
      limit: 100,
    });

    console.log('Step 4A API: Products list', products);

    // Transform products to include price information
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

    // Sort products by amount (lowest to highest)
    productsWithPrices.sort((a, b) => {
      const amountA = a.price?.amount || 0;
      const amountB = b.price?.amount || 0;
      return amountA - amountB;
    });

    res.status(200).json({ products: productsWithPrices });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Failed to get products: ${message}` });
  }
}

