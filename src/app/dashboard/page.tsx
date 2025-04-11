'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Package, 
  LogOut,
  DollarSign,
  Layers,
  Settings,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  
  useEffect(() => {
    // Add fade-in animation effect when component mounts
    setFadeIn(true);
  }, []);

  const handleLocalLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call our local logout endpoint
      await fetch('/api/auth/local-logout');
      // Redirect to login page
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Mock data for statistics
  const stats = [
    { id: 1, title: "Total Sales", value: "$12,426", icon: DollarSign, change: "+16%", trend: "up" },
    { id: 2, title: "Orders", value: "243", icon: ShoppingCart, change: "+12%", trend: "up" },
    { id: 3, title: "Customers", value: "56", icon: Users, change: "+25%", trend: "up" },
    { id: 4, title: "Products", value: "89", icon: Package, change: "+5%", trend: "up" }
  ];

  // Quick action menus
  const quickActions = [
    { title: "New Sale", icon: CreditCard, color: "bg-blue-500", href: "/pos" },
    { title: "Products", icon: Package, color: "bg-purple-500", href: "/products" },
    { title: "Customers", icon: Users, color: "bg-pink-500", href: "/customers" },
    { title: "Reports", icon: BarChart3, color: "bg-amber-500", href: "/reports" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Error</h2>
              <p className="text-red-600 dark:text-red-300">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Sidebar - can be expanded later if needed */}
      <div className="flex flex-1">
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="h-full p-4 flex flex-col">
            <div className="p-2 mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600-alt bg-clip-text text-transparent">Advanced POS</h2>
            </div>
            
            <nav className="space-y-1 flex-1">
              <a href="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200">
                <BarChart3 className="mr-3 h-5 w-5 text-blue-500" />
                <span>Dashboard</span>
              </a>
              
              {quickActions.map((item) => (
                <a key={item.title} href={item.href} className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors">
                  <item.icon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span>{item.title}</span>
                </a>
              ))}
            </nav>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <a href="/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors">
                <Settings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span>Settings</span>
              </a>
              
              <button 
                onClick={handleLocalLogout}
                disabled={isLoggingOut}
                className="w-full mt-2 flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 text-red-500 dark:text-red-400" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600-alt bg-clip-text text-transparent">
                {user ? `Welcome, ${user.name || (user.email ? user.email.split('@')[0] : 'User')}` : 'Dashboard'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </header>
            
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div 
                  key={stat.id}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {stat.title}
                      </div>
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${index % 2 === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-purple-600-alt'}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex items-baseline">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className={`ml-2 text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.change}
                      </div>
                    </div>
                  </div>
                  <div className={`h-1 w-full ${index % 4 === 0 ? 'bg-blue-500' : index % 4 === 1 ? 'bg-purple-500' : index % 4 === 2 ? 'bg-pink-500' : 'bg-amber-500'}`}></div>
                </div>
              ))}
            </div>
            
            {/* Quick actions */}
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {quickActions.map((action, index) => (
                <a 
                  key={action.title}
                  href={action.href}
                  className="block group"
                  style={{animationDelay: `${index * 0.15}s`}}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white ${action.color}`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {action.title}
                        </h3>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 