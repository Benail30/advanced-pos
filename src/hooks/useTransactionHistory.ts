import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  transactionNumber: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  cashier: {
    id: string;
    name: string;
    email: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseTransactionHistoryProps {
  startDate?: string;
  endDate?: string;
  userId?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
}

interface UseTransactionHistoryResult {
  transactions: Transaction[];
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTransactionHistory({
  startDate,
  endDate,
  userId,
  paymentMethod,
  page = 1,
  limit = 10,
}: UseTransactionHistoryProps = {}): UseTransactionHistoryResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (userId) queryParams.append('userId', userId);
      if (paymentMethod) queryParams.append('paymentMethod', paymentMethod);

      const response = await fetch(`/api/transactions/history?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error('Failed to fetch transaction history');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, startDate, endDate, userId, paymentMethod]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    pagination,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
} 