import { NextRequest, NextResponse } from 'next/server';

const backendApiV1 =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'production' ? 'https://api.orionpay.com.br/api/v1' : 'http://localhost:8080/api/v1');

const backendApi = backendApiV1.includes('/api/v1') ? backendApiV1.replace('/api/v1', '/api') : `${backendApiV1}/api`;

const rewriteSetCookieForEnv = (setCookie: string, isProd: boolean) => {
  if (isProd) return setCookie;
  return setCookie
    .replace(/;\s*secure/gi, '')
    .replace(/;\s*domain=[^;]+/gi, '')
    .replace(/;\s*samesite=none/gi, '; SameSite=Lax');
};

const splitSetCookieHeader = (headerValue: string): string[] => {
  const parts: string[] = [];
  let start = 0;
  let inExpires = false;
  for (let i = 0; i < headerValue.length; i++) {
    const ch = headerValue[i];
    if (ch === ',') {
      if (!inExpires) {
        parts.push(headerValue.slice(start, i).trim());
        start = i + 1;
      }
      continue;
    }
    if (ch === ';') {
      inExpires = false;
      continue;
    }
    if (!inExpires && (ch === 'E' || ch === 'e')) {
      const maybe = headerValue.slice(i, i + 8).toLowerCase();
      if (maybe === 'expires=') inExpires = true;
    }
  }
  const last = headerValue.slice(start).trim();
  if (last) parts.push(last);
  return parts.filter(Boolean);
};

const getSetCookies = (headers: Headers): string[] => {
  const anyHeaders = headers as unknown as { getSetCookie?: () => string[] };
  if (typeof anyHeaders.getSetCookie === 'function') return anyHeaders.getSetCookie();
  const single = headers.get('set-cookie');
  return single ? splitSetCookieHeader(single) : [];
};

const applyUpstreamCookies = (res: NextResponse, setCookieHeaders: string[], isProd: boolean) => {
  for (const raw of setCookieHeaders) {
    const rewritten = rewriteSetCookieForEnv(raw, isProd);
    const parts = rewritten.split(';').map((p) => p.trim()).filter(Boolean);
    const first = parts[0] ?? '';
    const eq = first.indexOf('=');
    if (eq <= 0) continue;
    const name = first.slice(0, eq);
    const value = first.slice(eq + 1);

    let path = '/';
    let httpOnly = false;
    let secure = false;
    let sameSite: 'strict' | 'lax' | 'none' | undefined = undefined;
    let maxAge: number | undefined = undefined;
    let expires: Date | undefined = undefined;

    for (const attr of parts.slice(1)) {
      const [k, ...rest] = attr.split('=');
      const key = (k ?? '').trim().toLowerCase();
      const v = rest.join('=').trim();
      if (key === 'path' && v) path = v;
      if (key === 'httponly') httpOnly = true;
      if (key === 'secure') secure = true;
      if (key === 'samesite' && v) {
        const vv = v.toLowerCase();
        if (vv === 'strict' || vv === 'lax' || vv === 'none') sameSite = vv;
      }
      if (key === 'max-age' && v) {
        const n = Number(v);
        if (Number.isFinite(n)) maxAge = n;
      }
      if (key === 'expires' && v) {
        const d = new Date(v);
        if (!Number.isNaN(d.getTime())) expires = d;
      }
    }

    res.cookies.set({
      name,
      value,
      path,
      httpOnly,
      secure,
      sameSite,
      maxAge,
      expires,
    });
  }
};

const readCredentials = async (req: NextRequest): Promise<{ username: string; password: string }> => {
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formText = await req.text();
    const form = new URLSearchParams(formText);
    const username = form.get('username') ?? '';
    const password = form.get('password') ?? '';
    return { username, password };
  }

  try {
    const json = (await req.json()) as unknown;
    if (typeof json === 'object' && json !== null) {
      const record = json as Record<string, unknown>;
      const username = typeof record.username === 'string' ? record.username : typeof record.email === 'string' ? record.email : '';
      const password = typeof record.password === 'string' ? record.password : '';
      return { username, password };
    }
  } catch {
    // ignore
  }

  const text = await req.text();
  try {
    const json = JSON.parse(text) as unknown;
    if (typeof json === 'object' && json !== null) {
      const record = json as Record<string, unknown>;
      const username = typeof record.username === 'string' ? record.username : typeof record.email === 'string' ? record.email : '';
      const password = typeof record.password === 'string' ? record.password : '';
      return { username, password };
    }
  } catch {
    // ignore
  }

  return { username: '', password: '' };
};

export async function POST(req: NextRequest) {
  const { username, password } = await readCredentials(req);
  const upstream = await fetch(`${backendApi}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({ email: username, password }),
  });

  const bodyText = await upstream.text();
  const res = new NextResponse(bodyText, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
      'Cache-Control': 'no-store',
    },
  });

  return res;
}
