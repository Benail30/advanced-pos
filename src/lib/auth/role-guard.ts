import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/client';

// Define role-based route access
const roleBasedRoutes = {
  admin: [
    '/admin',
    '/dashboard',
    '/pos',
    '/pos/register',
    '/pos/inventory',
    '/pos/customers',
    '/pos/reports',
    '/pos/transactions',
    '/pos/analytics',
    '/inventory',
    '/customers',
    '/transactions',
    '/reports',
    '/settings',
    '/products',
    '/api/products',
    '/api/customers',
    '/api/transactions',
    '/api/users',
    '/api/reports',
    '/api/categories',
    '/api/settings'
  ],
  cashier: [
    '/dashboard',
    '/pos',
    '/pos/register',
    '/pos/inventory',
    '/pos/customers',
    '/pos/transactions',
    '/inventory',
    '/customers',
    '/transactions',
    '/api/transactions',
    '/api/customers',
    '/api/products' // Cashiers need to read products
  ]
};

// Shared paths that are accessible by all authenticated users
const sharedPaths = [
  '/pos/history',
  '/pos/settings'
];

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/logout',
  '/api/auth/me',
  '/debug/db',
  '/api/debug/db',
  '/setup',
  '/api/setup'
];

// Check if a path matches any of the given patterns
const matchesPath = (path: string, patterns: string[]): boolean => {
  return patterns.some(pattern => 
    path === pattern || 
    path.startsWith(`${pattern}/`) ||
    (path.startsWith('/api/') && pattern.startsWith('/api/') && path.includes(pattern.substring(5)))
  );
};

// Get user role from email
export const getUserRole = (email: string | undefined): string | null => {
  if (!email) return null;
  
  // Check if user is admin based on email
  if (email === 'benalighassen30@gmail.com' || 
      email === 'admin@example.com') {
    return 'admin';
  }
  
  // Default to cashier role for other emails
  return 'cashier';
};

// Check if a path is public and doesn't need authentication
const isPublicPath = (path: string): boolean => {
  return publicPaths.some(pattern => 
    path === pattern || 
    path.startsWith(`${pattern}/`)
  );
};

// Role-based access control middleware
export async function roleGuard(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  try {
    // Check if this is a public path first
    if (isPublicPath(path)) {
      console.log(`Public path allowed: ${path}`);
      return NextResponse.next();
    }
    
    // Check for auth cookies
    const auth0Session = req.cookies.get('appSession')?.value;
    
    // If no valid session, redirect to login unless it would create a loop
    if (!auth0Session) {
      // Don't redirect to login if we're already trying to access login
      if (path.includes('login') || path.includes('auth')) {
        return NextResponse.next();
      }
      
      // Create login URL with return path
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('returnTo', path);
      
      console.log(`No auth session, redirecting to login page. Path: ${path}`);
      return NextResponse.redirect(loginUrl);
    }
    
    // If we have a session, check role-based access
    try {
      // For Auth0 SDK, we don't need to manually decode the session
      // The actual user data is handled by the useUser hook in components
      // Here we just need to make a basic role check based on email patterns
      
      // This is a simplified approach for middleware - production code might use a proper JWT validator
      const isAdmin = (auth0Session || '').includes('admin@example.com') || 
                     (auth0Session || '').includes('benalighassen30@gmail.com');
      
      const role = isAdmin ? 'admin' : 'cashier';
      
      // Check if the path is allowed for the user's role
      const allowedPaths = [...(roleBasedRoutes[role] || []), ...sharedPaths];
      
      if (!matchesPath(path, allowedPaths)) {
        console.log(`Access denied to ${path} for role ${role}`);
        
        // For API routes, return 403 Forbidden with a clear message
        if (path.startsWith('/api/')) {
          return new NextResponse(
            JSON.stringify({ 
              error: 'Access Denied', 
              message: 'You do not have permission to access this resource' 
            }),
            { 
              status: 403,
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        }
        
        // For page routes, redirect with error parameter
        const redirectUrl = new URL('/dashboard', req.url);
        redirectUrl.searchParams.set('accessError', path);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (err) {
      console.error('Error checking role:', err);
      // On error, allow the client-side component to handle the role checking
    }
    
    // If we have a session, allow access for now
    console.log(`Auth session found, allowing access to: ${path}`);
    return NextResponse.next();
  } catch (error) {
    console.error('Role guard error:', error);
    // In case of error, allow the request to prevent loops
    return NextResponse.next();
  }
} 