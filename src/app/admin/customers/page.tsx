'use client';

import AdminLayout from '@/components/layouts/admin-layout';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function CustomersPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">Manage your customer database</p>
          </div>
          <Link
            href="/admin/customers/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Link>
        </div>

        {/* Customers table will go here */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 text-center text-gray-500">
            Customer table coming soon...
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 