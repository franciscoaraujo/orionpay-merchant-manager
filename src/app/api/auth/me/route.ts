import { NextRequest, NextResponse } from 'next/server';

const backendApiV1 =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'production' ? 'https://api.orionpay.com.br/api/v1' : 'http://localhost:8080/api/v1');

const backendAuth = backendApiV1.includes('/api/v1') ? backendApiV1.replace('/api/v1', '/api/auth') : `${backendApiV1}/auth`;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  const upstream = await fetch(`${backendAuth}/me`, {
    method: 'GET',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      ...(auth ? { Authorization: auth } : {}),
    },
  });
  const body = await upstream.arrayBuffer();
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
