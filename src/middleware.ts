import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/inventory',
  '/customers',
  '/settings',
  '/reports',
];

const middleware = withMiddlewareAuthRequired(async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const res = NextResponse.next();

  // Add CORS headers
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  );

  // If it's not a protected path, allow access
  if (!isProtectedPath) {
    return res;
  }

  // For protected paths, the withMiddlewareAuthRequired wrapper will handle the auth check
  return res;
});

export default middleware;

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/pos/:path*',
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 