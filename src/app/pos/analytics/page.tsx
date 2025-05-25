'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BarChart2, Download, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface AnalyticsData {
  salesByDate: any[];
  topProducts: any[];
  salesByCategory: any[];
  customerInsights: any[];
  inventoryStatus: any[];
  hourlySales: any[];
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('/api/analytics/powerbi');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    // This would be replaced with actual Power BI report download functionality
    alert('Report download functionality will be implemented with Power BI integration');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <BarChart2 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/pos" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={downloadReport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </button>
            <button
              onClick={fetchAnalyticsData}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Power BI Integration</h2>
          
          {/* Power BI Embed Container */}
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Power BI Reports</h3>
              <p className="text-gray-500 mb-4">
                To integrate Power BI reports, you&apos;ll need to:
              </p>
              <ol className="text-left text-gray-500 list-decimal list-inside space-y-2 mb-6">
                <li>Create a Power BI workspace and reports</li>
                <li>Configure Azure AD authentication</li>
                <li>Get the report embed URL and token</li>
                <li>Add the Power BI JavaScript SDK</li>
              </ol>
              <a
                href="https://learn.microsoft.com/en-us/power-bi/developer/embedded/embed-sample-for-customers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Power BI Documentation
              </a>
            </div>
          </div>

          {/* Data Preview Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Data Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sales Overview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Sales Overview</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Sales</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${data?.salesByDate.reduce((sum, day) => sum + day.total_sales, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Transactions</span>
                    <span className="text-sm font-medium text-gray-900">
                      {data?.salesByDate.reduce((sum, day) => sum + day.total_transactions, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Top Categories</h4>
                <div className="space-y-2">
                  {data?.salesByCategory.slice(0, 3).map((category, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm text-gray-500">{category.category}</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${category.total_revenue.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Insights */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Insights</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Customers</span>
                    <span className="text-sm font-medium text-gray-900">
                      {data?.customerInsights.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Avg. Customer Spend</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${(data?.customerInsights.reduce((sum, customer) => sum + customer.total_spent, 0) / (data?.customerInsights.length || 1)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 