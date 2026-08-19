import type { Env } from '../_lib/env.d';

// Proxies the consultation booking form so the browser only ever sees
// same-origin /api/consultation, never the real webhook URL.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.text();

    await fetch(`${env.API_BASE_URL}/share-and-work-consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  } catch {
    // fire-and-forget — the client proceeds to the thank-you page regardless
  }

  return Response.json({ ok: true });
};
