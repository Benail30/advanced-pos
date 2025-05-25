'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingCart, BarChart, Shield, Users, Package, CreditCard, ArrowRight, CheckCircle, Settings } from 'lucide-react';

export default function HomePage() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Simulate system check
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Status Banner */}
      <div className={`bg-green-500 text-white text-center p-2 transition-all duration-500 ease-in-out ${isReady ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>System ready - All services operational</span>
        </div>
      </div>
      
      {/* Hero Section */}
      <header className="px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <ShoppingCart size={32} className="text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Advanced POS</h1>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Modern Point of Sale System
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10">
            A comprehensive solution with Power BI analytics integration for better business insights
          </p>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Login
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Link
              href="/pos/register"
              className="group bg-green-600 hover:bg-green-700 rounded-xl p-6 text-white shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center">
                <ShoppingCart className="h-10 w-10 mb-4" />
                <h3 className="text-xl font-bold mb-2">POS Register</h3>
                <p className="text-green-100 mb-4">Process sales and manage transactions</p>
                <div className="flex items-center mt-auto text-sm font-medium">
                  <span>Start Selling</span>
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            
            <Link
              href="/dashboard"
              className="group bg-blue-600 hover:bg-blue-700 rounded-xl p-6 text-white shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center">
                <BarChart className="h-10 w-10 mb-4" />
                <h3 className="text-xl font-bold mb-2">Business Dashboard</h3>
                <p className="text-blue-100 mb-4">Access reports and analytics</p>
                <div className="flex items-center mt-auto text-sm font-medium">
                  <span>View Insights</span>
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            
            <Link
              href="/setup"
              className="group bg-purple-600 hover:bg-purple-700 rounded-xl p-6 text-white shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center">
                <Settings className="h-10 w-10 mb-4" />
                <h3 className="text-xl font-bold mb-2">System Setup</h3>
                <p className="text-purple-100 mb-4">Configure database and initial data</p>
                <div className="flex items-center mt-auto text-sm font-medium">
                  <span>Setup System</span>
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-12 bg-white bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Powerful Features for Your Business
        </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Everything you need to manage your store efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
                <CreditCard className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Easy Transactions</h3>
              <p className="text-gray-600">
                Process sales quickly with our intuitive interface and multi-payment support
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
                <Package className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory Management</h3>
              <p className="text-gray-600">
                Keep track of products, stock levels, and receive automatic alerts
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Management</h3>
              <p className="text-gray-600">
                Maintain customer profiles and loyalty programs for better retention
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
                <BarChart className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Power BI Analytics</h3>
              <p className="text-gray-600">
                Make data-driven decisions with integrated Power BI dashboards
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
                <ShoppingCart className="h-6 w-6 text-indigo-600" />
        </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Multi-Store Support</h3>
              <p className="text-gray-600">
                Manage multiple locations with centralized inventory and reporting
              </p>
      </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Authentication</h3>
              <p className="text-gray-600">
                Role-based access control with Auth0 integration for maximum security
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© 2024 Advanced POS System. All rights reserved.</p>
      </div>
      </footer>
    </div>
  );
} 