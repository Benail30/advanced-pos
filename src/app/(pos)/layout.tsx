import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { ShoppingCart, Receipt, Package, Users, Settings } from 'lucide-react';

export default function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold">POS System</h1>
          <div className="flex items-center space-x-2">
            <span>{user?.name}</span>
            <a
              href="/api/auth/logout"
              className="text-sm text-gray-300 hover:text-white"
            >
              Logout
            </a>
          </div>
        </div>
        
        <nav className="space-y-2">
          <Link
            href="/pos"
            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Register</span>
          </Link>
          
          <Link
            href="/pos/transactions"
            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700"
          >
            <Receipt className="w-5 h-5" />
            <span>Transactions</span>
          </Link>
          
          <Link
            href="/pos/inventory"
            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700"
          >
            <Package className="w-5 h-5" />
            <span>Inventory</span>
          </Link>
          
          <Link
            href="/pos/customers"
            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700"
          >
            <Users className="w-5 h-5" />
            <span>Customers</span>
          </Link>
          
          <Link
            href="/pos/settings"
            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
} 