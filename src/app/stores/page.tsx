'use client';

import { useState, useEffect, useCallback } from 'react';
import { Store, Plus, Pencil, Trash2, Package, Users, ShoppingCart, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

type StoreData = {
  id: string;
  name: string;
  createdAt: string;
  _count: { products: number; cashiers: number; orders: number };
};

export default function StoresPage() {
  const { toast } = useToast();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);

  // Rename inline
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<StoreData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/stores');
    const json = await res.json();
    setStores(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    const res = await fetch('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: createName.trim() }),
    });
    const json = await res.json();
    setCreating(false);
    if (!res.ok) { toast({ title: json.error ?? 'Failed to create store', variant: 'destructive' }); return; }
    setStores(prev => [...prev, json.data]);
    setCreateName('');
    setShowCreate(false);
    toast({ title: `Store "${json.data.name}" created` });
  }

  function startRename(store: StoreData) {
    setRenamingId(store.id);
    setRenameValue(store.name);
  }

  function cancelRename() {
    setRenamingId(null);
    setRenameValue('');
  }

  async function handleRename(storeId: string) {
    if (!renameValue.trim()) return;
    setRenameSaving(true);
    const res = await fetch(`/api/stores/${storeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: renameValue.trim() }),
    });
    const json = await res.json();
    setRenameSaving(false);
    if (!res.ok) { toast({ title: json.error ?? 'Failed to rename', variant: 'destructive' }); return; }
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, name: json.data.name } : s));
    setRenamingId(null);
    toast({ title: 'Store renamed' });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/stores/${deleteTarget.id}`, { method: 'DELETE' });
    const json = await res.json();
    setDeleting(false);
    if (!res.ok) { toast({ title: json.error ?? 'Failed to delete', variant: 'destructive' }); return; }
    setStores(prev => prev.filter(s => s.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast({ title: `Store "${deleteTarget.name}" deleted` });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="text-sm text-gray-500 mt-0.5">{stores.length} store{stores.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />New Store
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-purple-500 border-t-transparent" />
        </div>
      ) : stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Store className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-sm font-medium text-gray-900">No stores yet</p>
          <p className="text-xs text-gray-500 mt-1">Create your first store to get started.</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />Create Store
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map(store => (
            <div key={store.id} className="bg-white border rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                    <Store className="h-5 w-5 text-purple-600" />
                  </div>
                  {renamingId === store.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <Input
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        className="h-7 text-sm py-0"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRename(store.id);
                          if (e.key === 'Escape') cancelRename();
                        }}
                      />
                      <button onClick={() => handleRename(store.id)} disabled={renameSaving}
                        className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={cancelRename}
                        className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="font-semibold text-gray-900 truncate">{store.name}</p>
                  )}
                </div>
                {renamingId !== store.id && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startRename(store)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(store)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-bold text-gray-900">{store._count.products}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-0.5 mt-0.5">
                    <Package className="h-3 w-3" />Products
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-bold text-gray-900">{store._count.cashiers}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-0.5 mt-0.5">
                    <Users className="h-3 w-3" />Cashiers
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="font-bold text-gray-900">{store._count.orders}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-0.5 mt-0.5">
                    <ShoppingCart className="h-3 w-3" />Orders
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Created {new Date(store.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Store</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newStoreName">Store name</Label>
              <Input
                id="newStoreName"
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                placeholder="e.g. Downtown Branch"
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating…' : 'Create Store'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{deleteTarget?.name}"?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            This will permanently delete the store and all its products, categories, orders, and cashier assignments.
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting…' : 'Delete Store'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
