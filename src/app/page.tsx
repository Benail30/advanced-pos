'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ShoppingCart, BarChart3, Package, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      title: 'Point of Sale',
      description: 'Easy-to-use interface for processing sales',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Real-time insights and reporting',
      icon: BarChart3,
      color: 'bg-purple-500'
    },
    {
      title: 'Inventory Management',
      description: 'Track and manage your stock efficiently',
      icon: Package,
      color: 'bg-green-500'
    },
    {
      title: 'Customer Management',
      description: 'Build and maintain customer relationships',
      icon: Users,
      color: 'bg-amber-500'
    }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Welcome to Advanced POS</h1>
        <p className="text-xl mb-8">
          A modern Point of Sale system with Power BI integration
        </p>
        <div className="flex gap-4">
          <Link
            href="/pos"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to POS
          </Link>
          <Link
            href="/dashboard"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
} 