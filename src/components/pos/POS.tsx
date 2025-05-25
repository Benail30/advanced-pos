'use client';

import { useState } from 'react';
import { ShoppingCart, Users, Receipt, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useUser } from '@auth0/nextjs-auth0/client';

export function POS() {
  const [currentTime] = useState(new Date());
  const { products, isLoading, stockChanged } = useProducts();
  const { user } = useUser();

  // Format date and time
  const formattedDate = currentTime.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Low stock products
  const lowStockProducts = products.filter(
    (product) => product.stockQuantity <= product.minStockLevel
  );

  // Quick action buttons - only show cashier-relevant actions
  const quickActions = [
    { name: 'New Sale', icon: ShoppingCart, href: '/pos/register', color: 'bg-blue-600' },
    { name: 'Recent Sales', icon: Receipt, href: '/pos/transactions', color: 'bg-green-600' },
    { name: 'Customers', icon: Users, href: '/pos/customers', color: 'bg-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              POS Register
              {isLoading && (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin ml-2" />
              )}
              {stockChanged && !isLoading && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                  <RefreshCw className="h-3 w-3 mr-1" /> Updated just now
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome, {user?.name || 'Cashier'}
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center space-x-1 text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <span>{formattedDate}</span>
            <span className="mx-2">•</span>
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Low Stock Warning */}
        {lowStockProducts.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
              <h3 className="text-amber-800 font-medium">
                Low Stock Alert
              </h3>
            </div>
            <div className="mt-2">
              <p className="text-amber-700 text-sm">
                The following products are running low on stock:
              </p>
              <ul className="mt-2 space-y-1">
                {lowStockProducts.map((product) => (
                  <li key={product.id} className="text-amber-700 text-sm">
                    • {product.name}: {product.stockQuantity} remaining
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-100 transition-all text-center flex flex-col items-center"
            >
              <div className={`h-14 w-14 rounded-full flex items-center justify-center text-white ${action.color} mb-4`}>
                <action.icon className="h-7 w-7" />
              </div>
              <span className="text-base font-medium text-gray-700">{action.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
} 