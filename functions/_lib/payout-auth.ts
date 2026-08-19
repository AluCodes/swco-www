import crypto from 'node:crypto';

// Generate hourly hash for automatic key rotation.
// Same algorithm as the previous Next.js implementation so existing
// tokens/links keep working unchanged.
export function generateHourlyHash(secret: string): string {
  const now = new Date();
  const dateHour = `${now.toISOString().split('T')[0]}-${now.getUTCHours()}`;
  return crypto.createHmac('sha256', secret).update(dateHour).digest('hex');
}
