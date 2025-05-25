'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Receipt, Search, Calendar } from 'lucide-react';
import axios from 'axios';

interface TransactionItem {
  product_id: number;
  quantity: number;
  price: number;
  name: string;
}

interface Transaction {
  id: number;
  customer_name: string;
  total_amount: number;
  tax_amount: number;
  created_at: string;
  payment_method: string;
  cash_amount: number | null;
  change_amount: number | null;
  items: TransactionItem[];
  split_payments?: {
    payment_method: string;
    amount: number;
  }[];
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toString().includes(searchQuery) ||
      transaction.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const transactionDate = new Date(transaction.created_at);
    const matchesDateRange = 
      (!dateRange.start || transactionDate >= new Date(dateRange.start)) &&
      (!dateRange.end || transactionDate <= new Date(dateRange.end));

    return matchesSearch && matchesDateRange;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
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
          <h1 className="text-xl font-bold text-gray-900">Transaction History</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Receipt className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No transactions found</p>
              <p className="text-sm mt-1">Try adjusting your search or date range</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map(transaction => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Transaction #{transaction.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                      {transaction.customer_name && (
                        <p className="text-sm text-gray-600 mt-1">
                          Customer: {transaction.customer_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        ${transaction.total_amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Tax: ${transaction.tax_amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Payment: {transaction.payment_method === 'split' ? 'Split Payment' : transaction.payment_method}
                      </p>
                      {transaction.cash_amount && (
                        <p className="text-sm text-gray-600">
                          Cash: ${transaction.cash_amount.toFixed(2)}
                          {transaction.change_amount && (
                            <span className="ml-2">Change: ${transaction.change_amount.toFixed(2)}</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {transaction.split_payments && transaction.split_payments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Split Payments</h4>
                      <div className="space-y-2">
                        {transaction.split_payments.map((payment, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">{payment.payment_method}</span>
                            <span className="text-gray-900">${payment.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
                    <div className="space-y-2">
                      {transaction.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      )}
        </div>
      </main>
    </div>
  );
} 