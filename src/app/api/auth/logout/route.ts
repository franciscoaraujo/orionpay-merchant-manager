import { NextRequest, NextResponse } from 'next/server';

const backendApiV1 =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'production' ? 'https://api.orionpay.com.br/api/v1' : 'http://localhost:8080/api/v1');

const backendApi = backendApiV1.includes('/api/v1') ? backendApiV1.replace('/api/v1', '/api') : `${backendApiV1}/api`;

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? '';

  const upstream = await fetch(`${backendApi}/auth/logout`, {
    method: 'POST',
    headers: {
      cookie,
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  const res = NextResponse.json(
    { ok: upstream.ok },
    { status: upstream.status, headers: { 'Cache-Control': 'no-store' } }
  );

  res.cookies.set({
    name: 'SESSION',
    value: '',
    path: '/',
    maxAge: 0,
  });

  res.cookies.set({
    name: 'JSESSIONID',
    value: '',
    path: '/',
    maxAge: 0,
  });

  return res;
}

