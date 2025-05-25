'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Download, Printer } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { generateInvoice } from '@/lib/services/mockInvoice';
import { DateRange } from 'react-day-picker';

// Mock transaction data for demo
const mockTransactions = [
  {
    id: '1',
    transactionNumber: 'TRX-123456',
    createdAt: new Date().toISOString(),
    cashier: { name: 'John Smith' },
    paymentMethod: 'cash',
    totalAmount: 150.99,
    status: 'completed'
  },
  {
    id: '2',
    transactionNumber: 'TRX-123457',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
    cashier: { name: 'Emma Wilson' },
    paymentMethod: 'credit_card',
    totalAmount: 89.95,
    status: 'completed'
  },
  {
    id: '3',
    transactionNumber: 'TRX-123458',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    cashier: { name: 'John Smith' },
    paymentMethod: 'debit_card',
    totalAmount: 45.50,
    status: 'completed'
  },
  {
    id: '4',
    transactionNumber: 'TRX-123459',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    cashier: { name: 'Sarah Johnson' },
    paymentMethod: 'e_wallet',
    totalAmount: 129.99,
    status: 'pending'
  }
];

// Mock hook for transaction history
function useTransactionHistory({ startDate, endDate, paymentMethod, page, limit }: any) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate API loading
  useState(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  });
  
  // Filter transactions based on params
  const filtered = mockTransactions.filter(tx => {
    if (paymentMethod && tx.paymentMethod !== paymentMethod) return false;
    if (startDate && new Date(tx.createdAt) < new Date(startDate)) return false;
    if (endDate && new Date(tx.createdAt) > new Date(endDate)) return false;
    return true;
  });
  
  return {
    transactions: filtered,
    pagination: {
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / (limit || 10)),
      currentPage: page || 1,
      itemsPerPage: limit || 10
    },
    isLoading,
    error: null
  };
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'e_wallet', label: 'E-Wallet' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

export default function TransactionHistoryPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [page, setPage] = useState(1);

  const {
    transactions,
    pagination,
    isLoading,
    error,
  } = useTransactionHistory({
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
    paymentMethod: paymentMethod || undefined,
    page,
    limit: 10,
  });

  const handleViewReceipt = async (transactionId: string) => {
    try {
      const invoice = await generateInvoice(transactionId);
      // Alert for demo since we don't have a real URL
      alert(`Invoice URL: ${invoice.url}`);
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };

  const handlePrintReceipt = async (transactionId: string) => {
    try {
      const invoice = await generateInvoice(transactionId);
      // Alert for demo
      alert(`Print invoice for transaction ${transactionId}`);
    } catch (error) {
      console.error('Error printing invoice:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <div className="flex items-center gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Select
            value={paymentMethod}
            onValueChange={setPaymentMethod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Methods</SelectItem>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Transaction #</TableHead>
              <TableHead>Cashier</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
              ))
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.createdAt), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{transaction.transactionNumber}</TableCell>
                  <TableCell>{transaction.cashier.name}</TableCell>
                  <TableCell className="capitalize">
                    {transaction.paymentMethod.replace('_', ' ')}
                  </TableCell>
                  <TableCell>${transaction.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReceipt(transaction.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrintReceipt(transaction.id)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 