import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { metabaseEmbedUrl, metabaseSiteUrl } from '@/lib/metabase';
import { AnalyticsShell } from './analytics-shell';
import type { TrendPoint, CashierStat, ProductStat } from './analytics-charts';

const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  const store = await prisma.store.findFirst({
    where: { adminId: session!.user.id },
    select: { id: true, name: true },
  });

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-medium text-gray-900">No store found</p>
        <p className="text-xs text-gray-500 mt-1">Contact your super admin.</p>
      </div>
    );
  }

  // ── Fetch all completed order items from last 30 days (for trend) ──────────
  const recentItems = await prisma.orderItem.findMany({
    where: {
      order: {
        storeId: store.id,
        status: 'COMPLETED',
        createdAt: { gte: THIRTY_DAYS_AGO },
      },
    },
    select: {
      quantity: true,
      unitPrice: true,
      unitCost: true,
      order: { select: { id: true, createdAt: true, cashierId: true,
        cashier: { select: { name: true, email: true } } } },
      product: { select: { id: true, name: true } },
    },
  });

  // ── Fetch ALL-TIME completed order items (for cashier + product charts) ────
  const allItems = await prisma.orderItem.findMany({
    where: { order: { storeId: store.id, status: 'COMPLETED' } },
    select: {
      quantity: true,
      unitPrice: true,
      unitCost: true,
      order: { select: { id: true, cashierId: true,
        cashier: { select: { name: true, email: true } } } },
      product: { select: { id: true, name: true } },
    },
  });

  // ── Build 30-day trend (fill zero days) ───────────────────────────────────
  const dayMap = new Map<string, { revenue: number; orders: Set<string>; profit: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dayMap.set(isoDate(d), { revenue: 0, orders: new Set(), profit: 0 });
  }
  for (const item of recentItems) {
    const day = isoDate(new Date(item.order.createdAt));
    const slot = dayMap.get(day);
    if (!slot) continue;
    const sell = Number(item.unitPrice);
    const cost = Number(item.unitCost);
    slot.revenue += sell * item.quantity;
    slot.profit  += (sell - cost) * item.quantity;
    slot.orders.add(item.order.id);
  }
  const trend: TrendPoint[] = Array.from(dayMap.entries()).map(([date, v]) => ({
    date: date.slice(5), // "MM-DD"
    revenue: Math.round(v.revenue * 100) / 100,
    profit:  Math.round(v.profit  * 100) / 100,
    orders:  v.orders.size,
  }));

  // ── Cashier performance (all time) ────────────────────────────────────────
  const cashierMap = new Map<string, { name: string; orders: Set<string>; revenue: number }>();
  for (const item of allItems) {
    const cid = item.order.cashierId;
    if (!cashierMap.has(cid)) {
      const label = item.order.cashier.name ?? item.order.cashier.email;
      cashierMap.set(cid, { name: label, orders: new Set(), revenue: 0 });
    }
    const slot = cashierMap.get(cid)!;
    slot.revenue += Number(item.unitPrice) * item.quantity;
    slot.orders.add(item.order.id);
  }
  const cashiers: CashierStat[] = Array.from(cashierMap.values())
    .map(v => ({ name: v.name, orders: v.orders.size, revenue: Math.round(v.revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── Product stats (all time, top 10 by qty) ───────────────────────────────
  const productMap = new Map<string, { name: string; qty: number; revenue: number; profit: number }>();
  for (const item of allItems) {
    const pid = item.product.id;
    if (!productMap.has(pid)) productMap.set(pid, { name: item.product.name, qty: 0, revenue: 0, profit: 0 });
    const slot = productMap.get(pid)!;
    const sell = Number(item.unitPrice);
    const cost = Number(item.unitCost);
    slot.qty     += item.quantity;
    slot.revenue += sell * item.quantity;
    slot.profit  += (sell - cost) * item.quantity;
  }
  const products: ProductStat[] = Array.from(productMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10)
    .map(v => ({
      name:    v.name,
      qty:     v.qty,
      revenue: Math.round(v.revenue * 100) / 100,
      profit:  Math.round(v.profit  * 100) / 100,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          {store.name} — charts and trends. Operational summary is on the{' '}
          <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>.
        </p>
      </div>
      <AnalyticsShell
        trend={trend}
        cashiers={cashiers}
        products={products}
        metabaseEmbedUrl={metabaseEmbedUrl()}
        metabaseSiteUrl={metabaseSiteUrl()}
      />
    </div>
  );
}
