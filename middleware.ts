import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/locker' || pathname === '/locker/') {
    return NextResponse.redirect(new URL(`https://locker.steakhouse.finance${search}`), { status: 307 });
  }

  if (pathname === '/explore' || pathname === '/explore/') {
    return NextResponse.redirect(new URL(`https://explore.steakhouse.finance${search}`), { status: 307 });
  }

  const tradingMatch = pathname.match(/^\/trading-chart\/([^\/?#]+)\/?$/);
  if (tradingMatch) {
    const token = tradingMatch[1];
    return NextResponse.redirect(new URL(`https://curve.steakhouse.finance/${token}${search}`), { status: 307 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/locker', '/explore', '/trading-chart/:path*'],
};
