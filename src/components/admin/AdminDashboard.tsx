'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Package, 
  DollarSign,
  Settings,
  Activity,
  Clipboard,
  Bell,
  UserPlus,
  Plus,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { PowerBIEmbed } from '@/components/power-bi/power-bi-embed';

export function AdminDashboard() {
  const { user } = useUser();
  const [currentTime] = useState(new Date());

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

  // Quick action buttons
  const quickActions = [
    { name: 'View Reports', icon: BarChart3, href: '/admin/reports', color: 'bg-blue-600' },
    { name: 'Manage Users', icon: Users, href: '/admin/users', color: 'bg-purple-600' },
    { name: 'Inventory', icon: Package, href: '/admin/inventory', color: 'bg-green-600' },
    { name: 'Sales', icon: DollarSign, href: '/admin/sales', color: 'bg-amber-600' },
    { name: 'System Status', icon: Activity, href: '/admin/status', color: 'bg-red-600' },
    { name: 'Settings', icon: Settings, href: '/admin/settings', color: 'bg-indigo-600' },
    { name: 'Logs', icon: Clipboard, href: '/admin/logs', color: 'bg-gray-600' },
    { name: 'Notifications', icon: Bell, href: '/admin/notifications', color: 'bg-pink-600' }
  ];

  // Mock data for stats (replace with real data later)
  const stats = [
    {
      title: 'Total Products',
      value: '1,234',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Sales Today',
      value: '$5,678',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Active Cashiers',
      value: '5',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Customers',
      value: '890',
      icon: UserPlus,
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name || user?.email?.split('@')[0] || 'Admin'}
          </h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with your store today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-500">
                  {stat.title}
                </div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Power BI Dashboard */}
        <div className="mb-8">
          <PowerBIEmbed
            reportName="Sales Analytics Dashboard"
            filterPaneEnabled={true}
            navContentPaneEnabled={true}
            refreshInterval={300000} // 5 minutes
          />
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Products</h2>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </Link>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Manage your product catalog and inventory
            </p>
            <Link
              href="/admin/products"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all products →
            </Link>
          </div>

          {/* Customers Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
              <Link
                href="/admin/customers/new"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Customer
              </Link>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              View and manage customer information
            </p>
            <Link
              href="/admin/customers"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all customers →
            </Link>
          </div>

          {/* Cashiers Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Cashiers</h2>
              <Link
                href="/admin/cashiers/new"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Cashier
              </Link>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Manage cashier accounts and permissions
            </p>
            <Link
              href="/admin/cashiers"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all cashiers →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 