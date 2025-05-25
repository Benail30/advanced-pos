'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserData {
  email: string;
  name: string;
  isLoggedIn: boolean;
}

export function UserProfile() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      // Load user data on component mount and setup storage event listener
      const loadUserData = () => {
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            setUser(JSON.parse(userData));
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('user');
          setUser(null);
        }
      };
      
      // Initial load
      loadUserData();
      
      // Set up a storage event listener to update the component when localStorage changes
      window.addEventListener('storage', loadUserData);
      
      // Clean up the event listener when component unmounts
      return () => {
        window.removeEventListener('storage', loadUserData);
      };
    }
  }, []);
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      // Dispatch a storage event to notify other components
      window.dispatchEvent(new Event('storage'));
    }
    setUser(null);
    setIsMenuOpen(false);
    router.push('/');
  };

  if (!user) {
    return (
      <Link 
        href="/auth/login"
        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="flex rounded-full bg-gray-100 text-sm focus:outline-none"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="sr-only">Open user menu</span>
        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 uppercase font-bold">
          {user.name.charAt(0)}
        </div>
      </button>
      
      {isMenuOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          
          <Link
            href="/settings"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
} 