'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { User, Settings, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function UserProfile() {
  const { user, error, isLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (isLoading) return <div className="w-8 h-8 animate-pulse rounded-full bg-gray-200"></div>;
  if (error) return <div className="text-red-500">Error</div>;
  if (!user) return null;

  const handleLogout = () => {
    router.push('/api/auth/logout');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Image
          src={user.picture || '/images/default-avatar.png'}
          alt={user.name || 'User avatar'}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">{user.name || user.email}</div>
          <div className="text-xs text-gray-500">Auth0 Account</div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">{user.name || user.email}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
          
          <div className="py-1">
            <a
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings className="w-4 h-4 mr-2" />
              Account Settings
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 