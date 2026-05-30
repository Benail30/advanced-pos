'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CURRENCY } from '@/lib/utils';

type OrderItem = { id: string; quantity: number; unitPrice: number; product: { name: string } };
type Order = {
  id: string;
  status: 'COMPLETED' | 'REFUNDED';
  paymentMethod: string;
  total: number;
  customerName: string | null;
  createdAt: string;
  items: OrderItem[];
};

const PAYMENT_LABELS: Record<string, string> = { CASH: 'Cash', CARD: 'Card', NFC: 'NFC' };

export default function PosHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const res = await fetch(`/api/orders?${params}`);
    const json = await res.json();
    setOrders(json.data ?? []);
    setLoading(false);
  }, [search, statusFilter, from, to]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/pos" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Order History</h1>
            <p className="text-sm text-gray-500">{orders.length} result{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search order ID or customer…" value={search}
              onChange={e => setSearch(e.target.value)} className="pl-9 bg-white" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white">
            <option value="">All statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white" />
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white" />
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 text-gray-400">No orders found</div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Order #', 'Date', 'Customer', 'Payment', 'Total', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map(order => (
                  <>
                    <tr key={order.id} className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">#{order.id}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}<br />
                        <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.customerName ?? <span className="italic text-gray-400">Walk-in</span>}</td>
                      <td className="px-4 py-3 text-gray-600">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{CURRENCY} {order.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge className={order.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : 'bg-red-100 text-red-600 hover:bg-red-100'}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {expandedId === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={7} className="px-8 py-4 bg-blue-50 border-b">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</p>
                          <div className="space-y-1.5 max-w-sm">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.product.name}
                                  <span className="text-gray-400 ml-2">× {item.quantity}</span>
                                </span>
                                <span className="font-medium">{CURRENCY} {(item.unitPrice * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between font-bold text-gray-900 border-t pt-1.5 mt-1">
                              <span>Total</span>
                              <span>{CURRENCY} {order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
