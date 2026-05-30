import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { metabaseEmbedUrl, metabaseSiteUrl } from "@/lib/metabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Store,
  Package,
  Users,
  Tag,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { CURRENCY } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 10;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const store = await prisma.store.findFirst({
    where: { adminId: session!.user.id },
    select: {
      name: true,
      createdAt: true,
      id: true,
      _count: { select: { products: true, cashiers: true, categories: true } },
    },
  });

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Store className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-sm font-medium text-gray-900">No store found</p>
        <p className="text-xs text-gray-500 mt-1">Contact your super admin.</p>
      </div>
    );
  }

  // Revenue = Σ unitPrice × qty  (COMPLETED orders only)
  // Profit  = Σ (unitPrice − unitCost) × qty
  const [orderItems, orderCount, lowStockCount] = await Promise.all([
    prisma.orderItem.findMany({
      where: { order: { storeId: store.id, status: "COMPLETED" } },
      select: { quantity: true, unitPrice: true, unitCost: true },
    }),
    prisma.order.count({
      where: { storeId: store.id, status: "COMPLETED" },
    }),
    prisma.product.count({
      where: { storeId: store.id, stock: { gt: 0, lt: LOW_STOCK_THRESHOLD } },
    }),
  ]);

  const totalRevenue = orderItems.reduce(
    (sum, i) => sum + Number(i.unitPrice) * i.quantity,
    0,
  );
  const totalProfit = orderItems.reduce(
    (sum, i) => sum + (Number(i.unitPrice) - Number(i.unitCost)) * i.quantity,
    0,
  );

  // Signed embed URL — storeId locked in JWT; embed can only show this store's data
  const embedUrl = metabaseEmbedUrl(store.id);
  const siteUrl = metabaseSiteUrl();

  return (
    <div className="space-y-6">
      {/* Identity */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session!.user.name ?? "Admin"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{session!.user.email}</p>
      </div>

      {/* Store banner */}
      <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Store className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <p className="text-xs text-purple-500 font-medium uppercase tracking-wide">
            Your Store
          </p>
          <p className="text-lg font-semibold text-gray-900">{store.name}</p>
        </div>
        <p className="ml-auto text-xs text-gray-400">
          Since {new Date(store.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* KPI cards — primary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue"
          value={`${CURRENCY} ${totalRevenue.toFixed(2)}`}
          sub="All completed orders"
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          color="green"
        />
        <MetricCard
          title="Gross Profit"
          value={`${CURRENCY} ${totalProfit.toFixed(2)}`}
          sub="Revenue minus cost of goods"
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          color="blue"
        />
        <MetricCard
          title="Orders"
          value={String(orderCount)}
          sub="Completed"
          icon={<ShoppingCart className="h-5 w-5 text-purple-600" />}
          color="purple"
        />
        <MetricCard
          title="Low Stock"
          value={String(lowStockCount)}
          sub={`< ${LOW_STOCK_THRESHOLD} units`}
          icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
          color="orange"
          alert={lowStockCount > 0}
        />
      </div>

      {/* KPI cards — store stats */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          title="Products"
          value={String(store._count.products)}
          icon={<Package className="h-5 w-5 text-blue-500" />}
          color="blue"
        />
        <MetricCard
          title="Categories"
          value={String(store._count.categories)}
          icon={<Tag className="h-5 w-5 text-green-500" />}
          color="green"
        />
        <MetricCard
          title="Cashiers"
          value={String(store._count.cashiers)}
          icon={<Users className="h-5 w-5 text-orange-500" />}
          color="orange"
        />
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm">
          <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
          <span className="text-orange-800 font-medium">
            {lowStockCount} product{lowStockCount !== 1 ? "s are" : " is"}{" "}
            running low on stock.
          </span>
          <a
            href="/inventory"
            className="ml-auto text-orange-600 underline hover:text-orange-700 text-xs"
          >
            View inventory →
          </a>
        </div>
      )}

      {/* ── Metabase embedded analytics ─────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
          </div>
          {siteUrl && (
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Open Metabase
            </a>
          )}
        </div>

        {embedUrl ? (
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
            <iframe
              src={embedUrl}
              width="100%"
              height="800"
              title="Metabase Analytics"
              style={{ border: "none", display: "block" }}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
            <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">
              Analytics not configured
            </p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Set{" "}
              <code className="bg-gray-100 px-1 rounded">
                METABASE_SECRET_KEY
              </code>{" "}
              and{" "}
              <code className="bg-gray-100 px-1 rounded">
                METABASE_DASHBOARD_ID
              </code>{" "}
              in <code className="bg-gray-100 px-1 rounded">.env.local</code>,
              then restart the dev server.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  sub,
  icon,
  color,
  alert,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "purple";
  alert?: boolean;
}) {
  const bg = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
  }[color];

  return (
    <Card className={alert ? "border-orange-300" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-1.5 rounded-lg ${bg}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div
          className={`text-3xl font-bold ${alert ? "text-orange-500" : "text-gray-900"}`}
        >
          {value}
        </div>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
