import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Store, Calendar, User, CreditCard } from 'lucide-react';
import { DownloadButton } from './download-button';

export default async function ReceiptPage({ params }: { params: { orderId: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      store: { select: { name: true } },
      cashier: { select: { name: true } },
      items: {
        include: { product: { select: { name: true } } },
      },
    },
  });

  if (!order) notFound();

  const total = Number(order.total);
  const items = order.items.map(i => ({ ...i, unitPrice: Number(i.unitPrice) }));

  const paymentLabel: Record<string, string> = { CASH: 'Cash', CARD: 'Credit Card', NFC: 'NFC / Mobile' };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border w-full max-w-md p-6 space-y-5">

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-gray-700 font-bold text-xl">
            <Store className="h-5 w-5" />
            {order.store.name}
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Receipt</p>
        </div>

        {/* Order meta */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Date
            </span>
            <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Order #</span>
            <span className="font-mono font-bold text-gray-900">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Cashier
            </span>
            <span className="font-medium">{order.cashier.name ?? '—'}</span>
          </div>
          {order.customerName && (
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" /> Payment
            </span>
            <span className="font-medium">{paymentLabel[order.paymentMethod] ?? order.paymentMethod}</span>
          </div>
          {order.status === 'REFUNDED' && (
            <div className="flex justify-center mt-1">
              <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">REFUNDED</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Items</p>
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.product.name}
                <span className="text-gray-400 ml-1">× {item.quantity}</span>
              </span>
              <span className="font-medium text-gray-900">${(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-4 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-green-600">${total.toFixed(2)}</span>
        </div>

        <p className="text-center text-xs text-gray-400">Thank you for your purchase!</p>

        <DownloadButton data={{
          orderId: order.id,
          storeName: order.store.name,
          date: new Date(order.createdAt).toLocaleString(),
          cashierName: order.cashier.name ?? '—',
          customerName: order.customerName,
          paymentMethod: order.paymentMethod,
          status: order.status,
          items: items.map(i => ({ id: i.id, name: i.product.name, quantity: i.quantity, unitPrice: i.unitPrice })),
          total,
        }} />
      </div>
    </div>
  );
}
