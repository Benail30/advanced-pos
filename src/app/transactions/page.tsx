import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pool } from 'pg';
import MainLayout from '@/components/layouts/main-layout';

interface Transaction {
  id: string;
  transaction_number: string;
  created_at: string;
  total_amount: string | number;
  payment_method: string;
}

function getPaymentBadge(method: string) {
  const color =
    method.toLowerCase() === 'cash'
      ? 'bg-blue-100 text-blue-800'
      : method.toLowerCase() === 'card'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
      {method}
    </span>
  );
}

async function getTransactions(): Promise<Transaction[]> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query(
      'SELECT id, transaction_number, created_at, total_amount, payment_method FROM transactions ORDER BY created_at DESC LIMIT 50'
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return [];
  } finally {
    await pool.end();
  }
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center text-gray-500">No transactions found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transaction #</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, idx) => (
                      <tr
                        key={tx.id}
                        className={
                          idx % 2 === 0
                            ? 'bg-white hover:bg-gray-50 transition-colors'
                            : 'bg-gray-50 hover:bg-gray-100 transition-colors'
                        }
                      >
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{idx + 1}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-mono">{tx.transaction_number}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {new Date(tx.created_at).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-green-700 font-semibold">
                          ${Number(tx.total_amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {getPaymentBadge(tx.payment_method)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 