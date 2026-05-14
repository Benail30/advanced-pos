'use client';

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export type TrendPoint = { date: string; revenue: number; orders: number; profit: number };
export type CashierStat = { name: string; orders: number; revenue: number };
export type ProductStat = { name: string; qty: number; revenue: number; profit: number };

const BLUE   = '#3b82f6';
const GREEN  = '#22c55e';
const PURPLE = '#a855f7';
const TEAL   = '#14b8a6';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{children}</h2>;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      {children}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-48 text-sm text-gray-400">{message}</div>
  );
}

// ── Revenue & Profit Trend ────────────────────────────────────────────────────
export function RevenueTrendChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) return <EmptyChart message="No completed orders in the last 30 days" />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={BLUE}  stopOpacity={0.15} />
            <stop offset="95%" stopColor={BLUE}  stopOpacity={0} />
          </linearGradient>
          <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={GREEN} stopOpacity={0.15} />
            <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={v => `$${v}`} width={56} />
        <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke={BLUE}
          fill="url(#revGrad)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="profit"  name="Profit"  stroke={GREEN}
          fill="url(#profGrad)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Daily Orders Trend ────────────────────────────────────────────────────────
export function OrdersTrendChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) return <EmptyChart message="No completed orders in the last 30 days" />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
          allowDecimals={false} width={32} />
        <Tooltip />
        <Bar dataKey="orders" name="Orders" fill={PURPLE} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Cashier Performance ───────────────────────────────────────────────────────
export function CashierChart({ data }: { data: CashierStat[] }) {
  if (!data.length) return <EmptyChart message="No cashier data" />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={v => `$${v}`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false}
          axisLine={false} width={90} />
        <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="revenue" name="Revenue" fill={TEAL} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Best-Selling Products ─────────────────────────────────────────────────────
export function TopProductsChart({ data }: { data: ProductStat[] }) {
  if (!data.length) return <EmptyChart message="No product sales data" />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false}
          axisLine={false} width={110} />
        <Tooltip />
        <Bar dataKey="qty" name="Units Sold" fill={BLUE} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Profit by Product ─────────────────────────────────────────────────────────
export function ProductProfitChart({ data }: { data: ProductStat[] }) {
  if (!data.length) return <EmptyChart message="No product profit data" />;
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={v => `$${v}`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false}
          axisLine={false} width={110} />
        <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
        <Bar dataKey="profit" name="Profit" fill={GREEN} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Full page wrapper (avoids passing many props between layouts) ──────────────
export function AnalyticsCharts({
  trend, cashiers, products,
}: {
  trend: TrendPoint[];
  cashiers: CashierStat[];
  products: ProductStat[];
}) {
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Revenue & Profit — last 30 days</SectionTitle>
        <ChartCard title="Revenue vs Profit (completed orders only, REFUNDED excluded)">
          <RevenueTrendChart data={trend} />
        </ChartCard>
      </div>

      <div>
        <SectionTitle>Order Volume — last 30 days</SectionTitle>
        <ChartCard title="Orders per Day">
          <OrdersTrendChart data={trend} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <SectionTitle>Cashier Performance</SectionTitle>
          <ChartCard title="Revenue by Cashier (all time, completed)">
            <CashierChart data={cashiers} />
          </ChartCard>
        </div>
        <div>
          <SectionTitle>Top Products by Units Sold</SectionTitle>
          <ChartCard title="Best Sellers (quantity, all time)">
            <TopProductsChart data={products.slice(0, 10)} />
          </ChartCard>
        </div>
      </div>

      <div>
        <SectionTitle>Profit by Product</SectionTitle>
        <ChartCard title="Gross Profit per Product (sell − cost) × qty, all time">
          <ProductProfitChart data={[...products].sort((a, b) => b.profit - a.profit).slice(0, 10)} />
        </ChartCard>
      </div>
    </div>
  );
}
