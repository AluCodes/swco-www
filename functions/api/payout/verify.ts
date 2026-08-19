import type { Env } from '../../_lib/env.d';
import { generateHourlyHash } from '../../_lib/payout-auth';

// Replaces the old getServerSideProps page-access gate on /payout, which
// can't run under a static export. Same token check, called client-side
// on page load instead of server-side before render.
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const validBearerToken = env.PAYOUT_ACCESS_TOKEN;
  const secretSalt = env.INTERNAL_API_KEY;

  if (!validBearerToken || !secretSalt) {
    return Response.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const url = new URL(request.url);
  let token = url.searchParams.get('auth');

  const authHeader = request.headers.get('authorization');
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token || token !== validBearerToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json({ hourlyApiKey: generateHourlyHash(secretSalt) });
};
