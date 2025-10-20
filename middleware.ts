import { NextResponse, type NextRequest } from 'next/server';

// Host-based routing: subdomains map to internal app routes
export function middleware(request: NextRequest) {
  // In production, let Vercel's rewrites handle host-based routing to minimize middleware overhead
  if (process.env.NODE_ENV === 'production') return NextResponse.next();

  const url = request.nextUrl.clone();
  const hostHeader = request.headers.get('host') || '';
  const hostname = hostHeader.split(':')[0].toLowerCase();
  const pathname = url.pathname;

  const hostMap: Record<string, string> = {
    'locker.steakhouse.finance': '/locker',
    'explore.steakhouse.finance': '/explore',
    'curve.steakhouse.finance': '/trading-chart',
    // Local dev convenience (use locker.localhost:3000, explore.localhost:3000, curve.localhost:3000)
    'locker.localhost': '/locker',
    'explore.localhost': '/explore',
    'curve.localhost': '/trading-chart',
  };

  const basePath = hostMap[hostname];

  if (basePath) {
    // Avoid double-prefixing if already on the internal route
    if (pathname === basePath || pathname.startsWith(`${basePath}/`)) {
      return NextResponse.next();
    }

    const destPath = pathname === '/' ? basePath : `${basePath}${pathname}`;
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = destPath;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all non-static paths; exclude next internals and all files with extensions
  matcher: ['/((?!api|_next/|.*\.[^/]+$).*)'],
};
