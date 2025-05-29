'use client';

import { usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import Navbar from './navbar';

/**
 * CONDITIONAL NAVBAR COMPONENT
 * 
 * This component is smart! It decides whether to show the navigation bar
 * based on what page the user is on and whether they're logged in.
 * 
 * NAVIGATION BAR APPEARS ON:
 * - Admin dashboard pages
 * - Inventory, customers, reports, settings pages
 * - Any page where an authenticated user needs navigation
 * 
 * NAVIGATION BAR HIDES ON:
 * - Landing page (for visitors who aren't logged in)
 * - Login pages (no need for navigation during login)
 * - POS pages (they have their own special navigation)
 */
export default function ConditionalNavbar() {
  // Get the current page URL path (like '/inventory' or '/login')
  const pathname = usePathname();
  // Get information about the current user (if anyone is logged in)
  const { user } = useUser();
  
  /**
   * RULE 1: Hide navbar on landing page for visitors
   * 
   * If someone visits our website without logging in,
   * don't show the navigation bar on the home page
   */
  if (pathname === '/' && !user) {
    return null; // Don't show anything
  }
  
  /**
   * RULE 2: Hide navbar on POS pages
   * 
   * POS (Point of Sale) pages have their own special layout
   * with navigation built into the POS interface
   */
  if (pathname.startsWith('/pos')) {
    return null; // Don't show anything
  }
  
  /**
   * RULE 3: Hide navbar on login pages
   * 
   * When people are trying to log in, they don't need
   * navigation links - just focus on logging in
   */
  if (pathname === '/login' || pathname === '/cashier-login') {
    return null; // Don't show anything
  }
  
  /**
   * RULE 4: Show navbar everywhere else
   * 
   * For all other pages (admin dashboard, inventory, etc.),
   * show the navigation bar
   */
  return <Navbar />;
} 