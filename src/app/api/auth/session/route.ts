import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cookies = req.cookies.getAll().map((c) => c.name);
  const hasSessionCookie = req.cookies.has('SESSION');
  const hasJSessionIdCookie = req.cookies.has('JSESSIONID');
  return NextResponse.json(
    {
      hasSessionCookie,
      hasJSessionIdCookie,
      hasAnySessionCookie: hasSessionCookie || hasJSessionIdCookie,
      cookieNames: cookies,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
