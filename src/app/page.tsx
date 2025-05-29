'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import AdminDashboard from '@/components/admin/dashboard';

/**
 * HOME PAGE COMPONENT
 * 
 * This is the main landing page of our Advanced POS System.
 * It shows different content based on who is visiting:
 * 
 * 1. If nobody is logged in → Shows welcome page with login buttons
 * 2. If an admin is logged in → Shows the admin dashboard
 * 3. If a cashier tries to visit → Redirects them to the POS system
 */
export default function Home() {
  // Get information about the current user (if anyone is logged in)
  const { user, isLoading } = useUser();
  const router = useRouter();

  /**
   * AUTOMATIC REDIRECTS
   * 
   * This code runs whenever the user or login status changes.
   * It automatically sends users to the right place:
   * - Admins stay here to see the dashboard
   * - Non-admins get sent to the POS system
   */
  useEffect(() => {
    if (user) {
      // Check if the user has admin role
      const userRoles = user['https://advanced-pos.com/roles'] as string[] || [];
      const isAdmin = userRoles.some(role => role.toLowerCase() === 'admin');
      
      if (!isAdmin) {
        // If not an admin, send them to the POS system
        router.push('/pos');
      }
      // If they are an admin, they stay on this page
    }
  }, [user, router]);

  /**
   * LOADING STATE
   * 
   * While we're checking if someone is logged in, show a nice loading animation
   * This prevents the page from flickering between different states
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-purple-100 rounded mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-purple-50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /**
   * ADMIN DASHBOARD
   * 
   * If someone is logged in and they're an admin, show them the dashboard
   */
  if (user) {
    const userRoles = user['https://advanced-pos.com/roles'] as string[] || [];
    const isAdmin = userRoles.some(role => role.toLowerCase() === 'admin');
    
    if (isAdmin) {
      return <AdminDashboard />;
    }
  }

  /**
   * WELCOME PAGE
   * 
   * This is what visitors see when they first come to our website
   * It has buttons to log in as either an admin or cashier
   */
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[2000px] mx-auto p-8 pt-16">
        
        {/* MAIN TITLE AND DESCRIPTION */}
        <div className="mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            Advanced POS<br />
            System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            A modern, secure, and efficient point of sale system designed for your business
          </p>
          
          {/* LOGIN BUTTONS */}
          <div className="flex gap-4">
            {/* Admin Login Button */}
            <Button
              asChild
              className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 h-auto"
            >
              <Link href="/api/auth/login">
                Get Started as Admin →
              </Link>
            </Button>
            
            {/* Cashier Login Button */}
            <Button
              asChild
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-lg px-8 py-6 h-auto"
            >
              <Link href="/cashier-login">
                Get Started as Cashier →
              </Link>
            </Button>
          </div>
        </div>

        {/* USER TYPES EXPLANATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Admin Access Card */}
          <div className="bg-white border-2 border-purple-100 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-purple-100 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Admin Access</h3>
            </div>
            <p className="text-gray-600">Full system control with Auth0 secure authentication</p>
          </div>
          
          {/* Cashier Access Card */}
          <div className="bg-white border-2 border-purple-100 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-purple-100 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Cashier Access</h3>
            </div>
            <p className="text-gray-600">Streamlined POS interface for day-to-day operations</p>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border-2 border-purple-100 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Modern Interface</h3>
            <p className="text-gray-600">Intuitive design that makes managing your business a breeze</p>
          </div>
          <div className="bg-white border-2 border-purple-100 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
            <p className="text-gray-600">Make data-driven decisions with powerful insights</p>
          </div>
          <div className="bg-white border-2 border-purple-100 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
            <p className="text-gray-600">Enterprise-grade security with role-based access control</p>
          </div>
        </div>
      </div>
    </div>
  );
} 