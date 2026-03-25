export const AUTH_TOKEN_COOKIE = 'orionpay_token';

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie.split(';').map((p) => p.trim());
  for (const part of parts) {
    if (!part) continue;
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = decodeURIComponent(part.slice(0, eq));
    if (key !== name) continue;
    return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

export function setCookie(
  name: string,
  value: string,
  options?: { maxAgeSeconds?: number; sameSite?: 'Strict' | 'Lax' | 'None'; secure?: boolean; path?: string }
) {
  if (typeof document === 'undefined') return;
  const encoded = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  const parts = [encoded];
  parts.push(`Path=${options?.path ?? '/'}`);
  parts.push(`SameSite=${options?.sameSite ?? 'Strict'}`);

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secure = options?.secure ?? (process.env.NODE_ENV === 'production' || isHttps);
  if (secure) parts.push('Secure');

  const maxAge = options?.maxAgeSeconds;
  if (typeof maxAge === 'number' && Number.isFinite(maxAge)) parts.push(`Max-Age=${Math.floor(maxAge)}`);

  document.cookie = parts.join('; ');
}

export function clearCookie(name: string) {
  setCookie(name, '', { maxAgeSeconds: 0, path: '/' });
}
