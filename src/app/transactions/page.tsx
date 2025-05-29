'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Download,
  Receipt, 
  Calendar,
  DollarSign,
  User,
  Package,
  Shield
} from 'lucide-react';

interface Transaction {
  id: number;
  customer_name: string | null;
  cashier_name: string | number;
  total_amount: string | number | null;
  payment_method: string | null;
  status: string | null;
  created_at: string;
  items: TransactionItem[];
}

interface TransactionItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: string | number | null;
  subtotal: string | number | null;
}

export default function TransactionsPage() {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  const { user: localUser, isLoading: localLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  // Check if either authentication method has a user
  const isAuthenticated = !!(auth0User || localUser);
  const isLoading = auth0Loading || localLoading;

  // Check authentication and role
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/cashier-login');
      return;
    }

    // Determine user role
    if (auth0User) {
      const userRoles = (auth0User['https://advanced-pos.com/roles'] as string[]) || [];
      const adminRole = userRoles.some(role => role.toLowerCase() === 'admin');
      setIsAdmin(adminRole);
      setUserRole(adminRole ? 'admin' : 'user');
    } else if (localUser) {
      setIsAdmin(false);
      setUserRole(localUser.role);
    }
  }, [isAuthenticated, isLoading, router, auth0User, localUser]);

  // Fetch transactions
  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
        if (data.meta) {
          setIsAdmin(data.meta.isAdmin);
          setUserRole(data.meta.userRole);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportTransactions = () => {
    const csv = [
      ['Transaction ID', 'Customer', 'Cashier', 'Total', 'Payment Method', 'Status', 'Date'].join(','),
      ...filteredTransactions.map(transaction => [
        transaction.id,
        transaction.customer_name || 'Walk-in Customer',
        transaction.cashier_name || 'Unknown',
        parseFloat(transaction.total_amount?.toString() || '0') || 0,
        transaction.payment_method || 'Unknown',
        transaction.status || 'Unknown',
        new Date(transaction.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const generateInvoice = async (transactionId: number) => {
    try {
      setGeneratingInvoice(true);
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: transactionId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Invoice ${result.data.invoice_number} generated successfully!`);
        // Optionally redirect to invoices page
        // router.push('/invoices');
      } else {
        alert(`Failed to generate invoice: ${result.error}`);
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice. Please try again.');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toString().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || transaction.status === statusFilter;
    const matchesPayment = !paymentFilter || transaction.payment_method === paymentFilter;
    
    let matchesDate = true;
    if (dateFilter) {
      const transactionDate = new Date(transaction.created_at).toDateString();
      const filterDate = new Date(dateFilter).toDateString();
      matchesDate = transactionDate === filterDate;
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const totalRevenue = transactions.reduce((sum, t) => {
    const amount = t.total_amount ? parseFloat(t.total_amount.toString()) : 0;
    return sum + (amount || 0);
  }, 0);
  const completedTransactions = transactions.filter(t => t.status === 'completed').length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="p-8">
      {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
                {userRole && (
                  <div className="mt-2">
                    {isAdmin ? (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Shield className="w-4 h-4" />
                        <span>Admin View - Showing all transactions</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <User className="w-4 h-4" />
                        <span>Cashier View - Showing your transactions only</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
        <button
          onClick={exportTransactions}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
                <Download className="w-4 h-4" />
                Export
        </button>
      </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Receipt className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-bold">{transactions.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Receipt className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">{completedTransactions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Receipt className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">{pendingTransactions}</p>
                  </div>
                </div>
              </div>
      </div>

      {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
                  <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Payment Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="digital">Digital</option>
                </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setPaymentFilter('');
                    setDateFilter('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Clear Filters
                </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cashier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{transaction.id.toString().slice(-8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{transaction.customer_name || 'Walk-in Customer'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-sm text-gray-900">{transaction.cashier_name || 'Unknown'}</span>
                  </div>
                </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${(transaction.total_amount ? parseFloat(transaction.total_amount.toString()) : 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.payment_method === 'cash' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.payment_method === 'card'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {transaction.payment_method ? 
                            transaction.payment_method.charAt(0).toUpperCase() + transaction.payment_method.slice(1) 
                            : 'Unknown'
                          }
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    transaction.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : transaction.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status ? 
                      transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
                      : 'Unknown'
                    }
                  </span>
                </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.created_at).toLocaleDateString()}
                </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                          onClick={() => viewTransactionDetails(transaction)}
                          className="text-blue-600 hover:text-blue-900"
                  >
                          View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
                  <p className="mt-1 text-sm text-gray-500">No transactions match your current filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Transaction Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="text-sm text-gray-900">#{selectedTransaction.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.customer_name || 'Walk-in Customer'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cashier</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.cashier_name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <p className="text-sm text-gray-900">${(selectedTransaction.total_amount ? parseFloat(selectedTransaction.total_amount.toString()) : 0).toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <p className="text-sm text-gray-900">{selectedTransaction.payment_method || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedTransaction.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : selectedTransaction.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedTransaction.status ? 
                      selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)
                      : 'Unknown'
                    }
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                </div>
              </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedTransaction.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">${(item.unit_price ? parseFloat(item.unit_price.toString()) : 0).toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">${(item.subtotal ? parseFloat(item.subtotal.toString()) : 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                </div>

            <div className="flex justify-end mt-6">
              <div className="flex gap-3">
                <button
                  onClick={() => generateInvoice(selectedTransaction.id)}
                  disabled={generatingInvoice}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Receipt className="w-4 h-4" />
                  {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
                </button>
                <button
                  onClick={() => router.push('/invoices')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  View Invoices
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 