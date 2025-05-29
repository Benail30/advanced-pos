'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings, Store, CreditCard, Bell, Shield, Globe, Moon, Sun, User, LogOut, UserCircle } from 'lucide-react';

export default function SettingsPage() {
  // Auth0 for admins
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  
  // Local auth for cashiers
  const { user: localUser, isLoading: localLoading, logout: localLogout } = useAuth();
  
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isLoading = auth0Loading || localLoading;
  const user = auth0User || localUser;
  const isAuth0User = !!auth0User;

  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/cashier-login');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    if (isAuth0User) {
      router.push('/api/auth/logout');
    } else {
      await localLogout();
    }
  };

  // Determine user role and info
  let userRole = 'cashier';
  let userName = '';
  let userEmail = '';
  let authMethod = 'Local';
  
  if (isAuth0User && auth0User) {
    const userRoles = auth0User['https://advanced-pos.com/roles'] as string[] || [];
    userRole = userRoles.some(role => role.toLowerCase() === 'admin') ? 'Admin' : 'User';
    userName = auth0User.name || '';
    userEmail = auth0User.email || '';
    authMethod = 'Auth0';
  } else if (localUser) {
    userRole = 'Cashier'; // Local users are always cashiers
    userName = localUser.name;
    userEmail = localUser.email;
    authMethod = 'Local';
  }

  const settingsSections = [
    {
      title: 'Store Settings',
      icon: Store,
      description: 'Configure your store information, currency, and tax rates',
      buttonText: 'Manage Store',
      href: '#store-settings'
    },
    {
      title: 'Payment Methods',
      icon: CreditCard,
      description: 'Set up and manage payment methods and processors',
      buttonText: 'Configure Payments',
      href: '#payment-settings'
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Customize your notification preferences and alerts',
      buttonText: 'Manage Notifications',
      href: '#notification-settings'
    },
    {
      title: 'Security',
      icon: Shield,
      description: 'Configure security settings and access controls',
      buttonText: 'Security Settings',
      href: '#security-settings'
    },
    {
      title: 'Language & Region',
      icon: Globe,
      description: 'Set your preferred language and regional settings',
      buttonText: 'Change Settings',
      href: '#language-settings'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-gray-600 dark:text-gray-300" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
          </div>
          <Button
            onClick={() => setIsDarkMode(!isDarkMode)}
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* User Profile Section */}
        <Card className="p-6 mb-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
                <UserCircle className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {userName}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">{userEmail}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${
                    isAuth0User 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  }`}>
                    {userRole} • {authMethod}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsSections.map((section, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <section.icon className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {section.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => router.push(section.href)}
                  >
                    {section.buttonText}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 