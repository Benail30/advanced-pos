'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { CURRENCY } from '@/lib/utils';

type OrderItem = { id: string; quantity: number; unitPrice: number; product: { name: string } };
type Order = {
  id: string;
  status: 'COMPLETED' | 'REFUNDED';
  paymentMethod: string;
  total: number;
  customerName: string | null;
  createdAt: string;
  cashier: { id: string; name: string | null; email: string };
  items: OrderItem[];
};

const PAYMENT_LABELS: Record<string, string> = { CASH: 'Cash', CARD: 'Card', NFC: 'NFC' };

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refunding, setRefunding] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (paymentFilter) params.set('paymentMethod', paymentFilter);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const res = await fetch(`/api/orders?${params}`);
    const json = await res.json();
    setOrders(json.data ?? []);
    setLoading(false);
  }, [search, statusFilter, paymentFilter, from, to]);

  useEffect(() => { load(); }, [load]);

  async function handleRefund(order: Order) {
    if (!confirm(`Refund order #${order.id}? Stock will be restored.`)) return;
    setRefunding(order.id);
    const res = await fetch(`/api/orders/${order.id}`, { method: 'POST' });
    const json = await res.json();
    setRefunding(null);
    if (!res.ok) { toast({ title: json.error ?? 'Refund failed', variant: 'destructive' }); return; }
    toast({ title: `Order #${order.id} refunded — stock restored` });
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'REFUNDED' } : o));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} result{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-2" />Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search order ID or customer…" value={search}
            onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-white">
          <option value="">All statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-white">
          <option value="">All payments</option>
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="NFC">NFC</option>
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
                {['Order #', 'Date', 'Cashier', 'Customer', 'Payment', 'Total', 'Status', ''].map(h => (
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
                    <td className="px-4 py-3 text-gray-700">{order.cashier.name ?? order.cashier.email}</td>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {order.status === 'COMPLETED' && (
                          <Button size="sm" variant="outline"
                            className="text-red-500 hover:text-red-600 hover:border-red-300 text-xs h-7"
                            disabled={refunding === order.id}
                            onClick={() => handleRefund(order)}>
                            <RotateCcw className="h-3 w-3 mr-1" />
                            {refunding === order.id ? 'Refunding…' : 'Refund'}
                          </Button>
                        )}
                        {expandedId === order.id
                          ? <ChevronUp className="h-4 w-4 text-gray-400" />
                          : <ChevronDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr key={`${order.id}-detail`}>
                      <td colSpan={8} className="px-8 py-4 bg-blue-50 border-b">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</p>
                        <div className="space-y-1.5 max-w-md">
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
  );
}
