import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Store, ShieldCheck, ShieldOff } from 'lucide-react';
import SuperAdminNav from '../components/super-admin-nav';
import { AdminsClient } from './admins-client';

export default async function SuperAdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') redirect('/super-admin/login');

  const [admins, storeCount] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        ownedStores: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            _count: { select: { products: true, cashiers: true, orders: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.store.count(),
  ]);

  const activeCount = admins.filter(a => a.isActive).length;
  const disabledCount = admins.length - activeCount;

  // Serialize dates for client component
  const serialized = admins.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    ownedStores: a.ownedStores.map(s => ({ ...s, createdAt: s.createdAt.toISOString() })),
  }));

  return (
    <div className="min-h-screen bg-slate-900">
      <SuperAdminNav email={session.user.email} />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Platform overview — manage all admin accounts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Admins</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{admins.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">Active</CardTitle>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-400">{activeCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">Disabled</CardTitle>
              <ShieldOff className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-400">{disabledCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">Stores</CardTitle>
              <Store className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{storeCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin list */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-slate-200">
            Admin Accounts
            <span className="text-slate-500 text-sm font-normal ml-2">({admins.length})</span>
          </h2>
          <AdminsClient initial={serialized} />
        </div>
      </main>
    </div>
  );
}
