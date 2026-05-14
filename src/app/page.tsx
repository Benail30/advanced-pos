'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShoppingCart, ArrowLeft, Sparkles, LockKeyhole, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'cashier' | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (session.user.role === 'CASHIER') router.push('/pos');
    if (session.user.role === 'ADMIN') router.push('/dashboard');
    if (session.user.role === 'SUPER_ADMIN') router.push('/super-admin/dashboard');
  }, [session, status, router]);

  if (status === 'loading') {
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

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse h-8 w-32 bg-purple-100 rounded" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12 rounded-3xl border border-purple-100 bg-white/80 backdrop-blur p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-sm font-medium mb-5">
            <Sparkles className="w-4 h-4" />
            Advanced POS Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
            Advanced POS
          </h1>
          <p className="text-2xl text-gray-800 mb-2">Are you an Admin or Cashier?</p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl">
            Choose your role to continue with the correct tools and permissions.
          </p>

          {!selectedRole && (
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setSelectedRole('admin')}
                className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 h-auto shadow-sm"
              >
                <ShieldCheck className="w-5 h-5 mr-2" />
                Admin
              </Button>
              <Button
                onClick={() => setSelectedRole('cashier')}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-lg px-8 py-6 h-auto"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cashier
              </Button>
            </div>
          )}

          {selectedRole === 'admin' && (
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 h-auto shadow-sm"
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                asChild
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-lg px-8 py-6 h-auto"
              >
                <Link href="/register">Sign Up</Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedRole(null)}
                className="text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          )}

          {selectedRole === 'cashier' && (
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 h-auto shadow-sm"
              >
                <Link href="/cashier/login">Log In</Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedRole(null)}
                className="text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-purple-100 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Admin Access</h3>
            </div>
            <p className="text-gray-600">Full system control with secure authentication and role-based access.</p>
          </div>

          <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-purple-100 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Cashier Access</h3>
            </div>
            <p className="text-gray-600">Streamlined checkout interface optimized for fast day-to-day sales operations.</p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Modern Interface</h3>
            </div>
            <p className="text-gray-600">Clear, fast workflows for staff and management teams.</p>
          </div>
          <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Real-time Analytics</h3>
            </div>
            <p className="text-gray-600">Monitor operations and performance with live business metrics.</p>
          </div>
          <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <LockKeyhole className="w-4 h-4 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Secure & Reliable</h3>
            </div>
            <p className="text-gray-600">Enterprise-grade authentication and role-based permissions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
