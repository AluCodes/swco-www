import type { Env } from '../_lib/env.d';

// Proxies the consultation booking form so the browser only ever sees
// same-origin /api/consultation, never the real webhook URL.
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // TEMPORARY diagnostics — remove once the missing-webhook issue is confirmed fixed.
  // Never includes the actual API_BASE_URL value, only whether it's set and how the
  // forward attempt went, so it's safe to curl directly against production.
  let backendStatus: number | null = null;
  let backendError: string | null = null;

  try {
    const body = await request.text();

    if (!env.API_BASE_URL) {
      backendError = 'API_BASE_URL is not configured';
      console.error('Consultation API: API_BASE_URL is not configured');
    } else {
      const response = await fetch(`${env.API_BASE_URL}/share-and-work-consultation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      backendStatus = response.status;

      if (!response.ok) {
        const responseBody = await response.text();
        backendError = responseBody.slice(0, 500);
        console.error('Consultation API: backend responded with', response.status, responseBody);
      }
    }
  } catch (error) {
    // fire-and-forget — the client proceeds to the thank-you page regardless,
    // but log so failures are visible via `wrangler pages deployment tail`
    backendError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Consultation API: failed to forward booking', error);
  }

  return Response.json({
    ok: true,
    apiBaseUrlConfigured: !!env.API_BASE_URL,
    backendStatus,
    backendError,
  });
};
