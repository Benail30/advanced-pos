import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_ROUTES = [
  '/dashboard',
  '/inventory',
  '/orders',
  '/users',
  '/stores',
  '/settings',
];

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const role = token?.role as 'SUPER_ADMIN' | 'ADMIN' | 'CASHIER' | undefined;

  // ── Super-admin protected routes (everything under /super-admin except /super-admin/login) ──
  if (pathname.startsWith('/super-admin') && pathname !== '/super-admin/login') {
    if (!token || role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/super-admin/login', request.url));
    }
    return NextResponse.next();
  }

  // ── Super-admin login page ──
  if (pathname === '/super-admin/login') {
    if (token && role === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── Admin-only routes ──
  if (isAdminRoute(pathname)) {
    if (!token || role !== 'ADMIN') {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Cashier-only route ──
  if (pathname === '/pos' || pathname.startsWith('/pos/')) {
    if (!token || role !== 'CASHIER') {
      const url = new URL('/cashier/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Admin auth pages: redirect if already logged in ──
  if (pathname === '/login' || pathname === '/register') {
    if (token && role === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
    }
    if (token && role === 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── Cashier login page: redirect if already logged in as CASHIER ──
  if (pathname === '/cashier/login') {
    if (token && role === 'CASHIER') {
      return NextResponse.redirect(new URL('/pos', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/inventory/:path*',
    '/orders/:path*',
    '/users/:path*',
    '/stores/:path*',
    '/settings/:path*',
    '/pos',
    '/pos/:path*',
    '/super-admin/:path*',
    '/login',
    '/register',
    '/cashier/login',
  ],
};
