import { createHmac } from 'crypto';

/**
 * Generate a Metabase signed-embed URL for a dashboard.
 * Uses HS256 (HMAC-SHA256) — the only algorithm Metabase supports for embeds.
 * Returns null when any required env var is missing or invalid.
 *
 * IMPORTANT: call this only in server components / API routes.
 * The secret key must never be sent to the browser.
 */
export function metabaseEmbedUrl(): string | null {
  const siteUrl = process.env.METABASE_SITE_URL?.replace(/\/$/, '');
  const secretKey = process.env.METABASE_SECRET_KEY;
  const rawId = process.env.METABASE_DASHBOARD_ID;

  if (!siteUrl || !secretKey || !rawId) return null;

  const dashboardId = parseInt(rawId, 10);
  if (isNaN(dashboardId)) return null;

  // Build JWT: header.payload.signature  (all base64url, no padding)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .toString('base64url');

  const payload = Buffer.from(JSON.stringify({
    resource: { dashboard: dashboardId },
    params: {},
    exp: Math.round(Date.now() / 1000) + 3600, // 1-hour window
  })).toString('base64url');

  const signature = createHmac('sha256', secretKey)
    .update(`${header}.${payload}`)
    .digest('base64url');

  const token = `${header}.${payload}.${signature}`;

  // #bordered=false&titled=false → frameless; tweak via env if needed
  return `${siteUrl}/embed/dashboard/${token}#bordered=false&titled=false`;
}

/** True when METABASE_SITE_URL is set, regardless of embed config. */
export function metabaseRunning(): boolean {
  return Boolean(process.env.METABASE_SITE_URL);
}

export function metabaseSiteUrl(): string | null {
  return process.env.METABASE_SITE_URL ?? null;
}
