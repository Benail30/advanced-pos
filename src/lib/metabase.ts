import { createHmac } from 'crypto';

/**
 * Generate a signed Metabase embed URL for a dashboard.
 * storeId is locked in the JWT payload so the embedded view is
 * scoped to that store only — users cannot override it client-side.
 *
 * Call only from server components / API routes; the secret key must
 * never reach the browser.
 */
export function metabaseEmbedUrl(storeId?: string): string | null {
  const siteUrl   = process.env.METABASE_SITE_URL?.replace(/\/$/, '');
  const secretKey = process.env.METABASE_SECRET_KEY;
  const rawId     = process.env.METABASE_DASHBOARD_ID;

  if (!siteUrl || !secretKey || !rawId) return null;

  const dashboardId = parseInt(rawId, 10);
  if (isNaN(dashboardId)) return null;

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .toString('base64url');

  // Lock store_id so the embed can never show another tenant's data.
  // An absent storeId produces an empty params object — data will be
  // unfiltered, so always pass a real storeId in production.
  const params = storeId ? { store_id: storeId } : {};

  const payload = Buffer.from(JSON.stringify({
    resource: { dashboard: dashboardId },
    params,
    exp: Math.round(Date.now() / 1000) + 3600,
  })).toString('base64url');

  const signature = createHmac('sha256', secretKey)
    .update(`${header}.${payload}`)
    .digest('base64url');

  const token = `${header}.${payload}.${signature}`;
  return `${siteUrl}/embed/dashboard/${token}#bordered=false&titled=false`;
}

export function metabaseSiteUrl(): string | null {
  return process.env.METABASE_SITE_URL ?? null;
}
