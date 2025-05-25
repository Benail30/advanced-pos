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
  ArrowRight,
  TrendingUp,
  Calendar
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

interface DashboardStats {
  totalSales: number;
  orders: number;
  customers: number;
  products: number;
}

interface RecentTransaction {
  id: string;
  customer: string;
  amount: number;
  created_at: string;
  status: string;
}

// Mock data for charts
const salesData = [
  { month: 'Jan', sales: 4000 },
  { month: 'Feb', sales: 3000 },
  { month: 'Mar', sales: 5000 },
  { month: 'Apr', sales: 4780 },
  { month: 'May', sales: 5890 },
  { month: 'Jun', sales: 4390 },
  { month: 'Jul', sales: 6490 },
];

const revenueTrend = [
  { date: '2024-01-01', revenue: 1200 },
  { date: '2024-02-01', revenue: 2100 },
  { date: '2024-03-01', revenue: 800 },
  { date: '2024-04-01', revenue: 1600 },
  { date: '2024-05-01', revenue: 2400 },
  { date: '2024-06-01', revenue: 2000 },
];

const productCategories = [
  { name: 'Beverages', value: 400 },
  { name: 'Snacks', value: 300 },
  { name: 'Dairy', value: 300 },
  { name: 'Produce', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const topCustomers = [
  { name: 'Alice', value: 2400 },
  { name: 'Bob', value: 2210 },
  { name: 'Charlie', value: 2290 },
  { name: 'Diana', value: 2000 },
  { name: 'Eve', value: 2181 },
];

const paymentMethods = [
  { name: 'Cash', value: 400 },
  { name: 'Credit Card', value: 300 },
  { name: 'Mobile', value: 300 },
];

export default function DashboardPage() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const [fadeIn, setFadeIn] = useState(false);
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  
  useEffect(() => {
    setFadeIn(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
    if (!isLoading && !user) {
        const returnTo = encodeURIComponent(window.location.pathname);
        router.push(`/api/auth/login?returnTo=${returnTo}`);
    }
    };
    checkAuth();
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const res = await fetch('/api/dashboard-stats');
        if (res.ok) {
          setStatsData(await res.json());
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
      setLoadingStats(false);
    }

    async function fetchRecentTransactions() {
      setLoadingTransactions(true);
      try {
        const res = await fetch('/api/recent-transactions');
        if (res.ok) {
          setRecentTransactions(await res.json());
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
      setLoadingTransactions(false);
    }

    fetchStats();
    fetchRecentTransactions();
  }, [user]);

  const handleLogout = async () => {
    try {
      window.location.href = '/api/auth/logout';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const stats = [
    { id: 1, title: "Total Sales", value: statsData ? `$${statsData.totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '', icon: DollarSign, change: '', trend: "up" },
    { id: 2, title: "Orders", value: statsData ? statsData.orders.toLocaleString() : '', icon: ShoppingCart, change: '', trend: "up" },
    { id: 3, title: "Customers", value: statsData ? statsData.customers.toLocaleString() : '', icon: Users, change: '', trend: "up" },
    { id: 4, title: "Products", value: statsData ? statsData.products.toLocaleString() : '', icon: Package, change: '', trend: "up" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error</h2>
              <p className="text-red-600 dark:text-red-400">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {user ? `Welcome, ${user.name || (user.email ? user.email.split('@')[0] : 'User')}` : 'Dashboard'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
                </div>
                <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <Calendar className="h-5 w-5" />
                  <span>Today</span>
                  </div>
                  {user && (
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            </header>
            
            {/* Stats row */}
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white px-1">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div 
                  key={stat.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {stat.title}
                      </div>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white bg-blue-${500 + (index * 100)}`}>
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
                <div className={`h-1 w-full bg-blue-${500 + (index * 100)} rounded-b-xl`}></div>
                </div>
              ))}
            </div>
            
          {/* Power BI-style Dashboard Charts */}
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white px-1 mt-10">Business Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* 1. Sales Overview (Bar Chart) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <h3 className="font-semibold mb-2">Sales Overview</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
                      </div>

            {/* 2. Revenue Trend (Line Chart) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <h3 className="font-semibold mb-2">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
                      </div>

            {/* 3. Product Category Distribution (Pie Chart) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <h3 className="font-semibold mb-2">Product Category Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={productCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {productCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
                </div>

            {/* 4. Top Customers (Horizontal Bar Chart) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <h3 className="font-semibold mb-2">Top Customers</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topCustomers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
                </div>

            {/* 5. Transactions by Payment Method (Donut Chart) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <h3 className="font-semibold mb-2">Transactions by Payment Method</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={paymentMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label>
                    {paymentMethods.map((entry, index) => (
                      <Cell key={`cell-pm-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Recent Activity Section */}
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white px-1">Recent Activity</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
            {/* Recent transactions table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{transaction.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${transaction.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 