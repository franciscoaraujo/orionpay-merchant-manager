import { NextRequest, NextResponse } from 'next/server';

const backendApiV1 =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'production' ? 'https://api.orionpay.com.br/api/v1' : 'http://localhost:8080/api/v1');

const backendAuth = backendApiV1.includes('/api/v1') ? backendApiV1.replace('/api/v1', '/api/auth') : `${backendApiV1}/auth`;

export async function POST(req: NextRequest) {
  const { refreshToken } = (await req.json()) as { refreshToken: string };
  const upstream = await fetch(`${backendAuth}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    body: JSON.stringify({ refreshToken }),
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
