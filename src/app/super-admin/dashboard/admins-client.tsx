'use client';

import { useState } from 'react';
import { Store, Package, Users, Trash2, ShieldOff, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';

export type AdminRow = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  createdAt: string;
  ownedStores: {
    id: string;
    name: string;
    createdAt: string;
    _count: { products: number; cashiers: number; orders: number };
  }[];
};

export function AdminsClient({ initial }: { initial: AdminRow[] }) {
  const [admins, setAdmins] = useState<AdminRow[]>(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function handleToggle(admin: AdminRow) {
    setToggling(admin.id);
    const res = await fetch(`/api/super-admin/admins/${admin.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !admin.isActive }),
    });
    setToggling(null);
    if (res.ok) {
      setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, isActive: !a.isActive } : a));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    const res = await fetch(`/api/super-admin/admins/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.ok) {
      setAdmins(prev => prev.filter(a => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else {
      const body = await res.json().catch(() => ({}));
      setDeleteError(body.error ?? 'Delete failed');
    }
  }

  if (admins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldCheck className="h-12 w-12 text-slate-600 mb-4" />
        <p className="text-slate-400">No admins registered yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 border-b border-slate-700">
            <tr>
              {['Admin', 'Stores', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {admins.map(admin => {
              const isExpanded = expandedId === admin.id;
              const storeCount = admin.ownedStores.length;
              return (
                <>
                  <tr
                    key={admin.id}
                    className={`bg-slate-800/50 hover:bg-slate-800 transition-colors ${!admin.isActive ? 'opacity-60' : ''}`}
                  >
                    {/* Admin */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{admin.name ?? <span className="italic text-slate-500">Unnamed</span>}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{admin.email}</p>
                    </td>

                    {/* Stores */}
                    <td className="px-4 py-3">
                      {storeCount === 0 ? (
                        <span className="text-slate-500 italic text-xs">No store</span>
                      ) : (
                        <button
                          className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors text-xs"
                          onClick={() => setExpandedId(isExpanded ? null : admin.id)}
                        >
                          <Store className="h-3.5 w-3.5 text-slate-400" />
                          {storeCount} store{storeCount !== 1 ? 's' : ''}
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {admin.isActive ? (
                        <Badge className="bg-emerald-900/40 text-emerald-400 border border-emerald-700/50 hover:bg-emerald-900/40 text-xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-900/40 text-red-400 border border-red-700/50 hover:bg-red-900/40 text-xs">
                          Disabled
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={toggling === admin.id}
                          onClick={() => handleToggle(admin)}
                          className={admin.isActive
                            ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 h-7 px-2 text-xs'
                            : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 h-7 px-2 text-xs'}
                          title={admin.isActive ? 'Deactivate' : 'Re-enable'}
                        >
                          {toggling === admin.id ? (
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin inline-block" />
                          ) : admin.isActive ? (
                            <><ShieldOff className="h-3.5 w-3.5 mr-1" />Disable</>
                          ) : (
                            <><ShieldCheck className="h-3.5 w-3.5 mr-1" />Enable</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setDeleteTarget(admin); setDeleteError(''); }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/30 h-7 px-2"
                          title="Delete admin"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && admin.ownedStores.map(store => (
                    <tr key={`${admin.id}-${store.id}`} className="bg-slate-900/60">
                      <td />
                      <td colSpan={4} className="px-4 py-3">
                        <div className="flex items-center gap-4 text-xs">
                          <span className="font-medium text-slate-200">{store.name}</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Package className="h-3 w-3" />{store._count.products} products
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Users className="h-3 w-3" />{store._count.cashiers} cashiers
                          </span>
                          <span className="text-slate-500">
                            {store._count.orders} orders
                          </span>
                          <span className="text-slate-600">
                            since {new Date(store.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) { setDeleteTarget(null); setDeleteError(''); } }}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Delete Admin Account</DialogTitle>
            <DialogDescription className="text-slate-400">
              Permanently delete{' '}
              <span className="text-white font-medium">{deleteTarget?.name ?? deleteTarget?.email}</span>
              {' '}and all their stores, products, categories, and order history. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
          <DialogFooter>
            <Button variant="ghost" className="text-slate-400 hover:text-white"
              onClick={() => { setDeleteTarget(null); setDeleteError(''); }} disabled={deleting}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
