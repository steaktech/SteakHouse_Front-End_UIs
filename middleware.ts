import { NextResponse, type NextRequest } from 'next/server';

// Host-based routing: subdomains map to internal app routes
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostHeader = request.headers.get('host') || '';
  const hostname = hostHeader.split(':')[0].toLowerCase();
  const pathname = url.pathname;

  // Skip static assets and Next internals so images/CSS/etc. load on subdomains
  const ASSET_PREFIXES = ['/images', '/css', '/docs'];
  const ASSET_EXT = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|txt|map|pdf|woff2?|ttf|eot)$/i;
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    ASSET_PREFIXES.some((p) => pathname.startsWith(p)) ||
    ASSET_EXT.test(pathname)
  ) {
    return NextResponse.next();
  }

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
  // Run on all pages except Next.js internals and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
