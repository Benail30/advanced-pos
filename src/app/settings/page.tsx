'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, Store, UserCircle, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

type StoreData = {
  id: string;
  name: string;
  createdAt: string;
  _count: { products: number; cashiers: number; orders: number };
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [store, setStore] = useState<StoreData | null>(null);
  const [storeName, setStoreName] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(j => {
        const first = j.data?.[0] ?? null;
        setStore(first);
        if (first) setStoreName(first.name);
        setLoading(false);
      });
  }, []);

  async function handleSaveStore(e: React.FormEvent) {
    e.preventDefault();
    if (!store || !storeName.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/stores/${store.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: storeName.trim() }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast({ title: json.error ?? 'Failed to save', variant: 'destructive' });
      return;
    }
    setStore(json.data);
    toast({ title: 'Store name updated' });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your store and account</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCircle className="h-4 w-4 text-purple-500" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{session?.user?.name ?? 'Admin'}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Mail className="h-3 w-3" />{session?.user?.email}
              </p>
            </div>
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
              ADMIN
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Store settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="h-4 w-4 text-blue-500" />
            Store
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!store ? (
            <p className="text-sm text-gray-500">No store assigned to your account.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{store._count.products}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Products</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{store._count.cashiers}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Cashiers</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{store._count.orders}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Orders</p>
                </div>
              </div>

              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created {new Date(store.createdAt).toLocaleDateString()}
              </div>

              <form onSubmit={handleSaveStore} className="space-y-3 pt-2 border-t">
                <div className="space-y-1.5">
                  <Label htmlFor="storeName">Store name</Label>
                  <Input
                    id="storeName"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    placeholder="Enter store name"
                    required
                  />
                </div>
                <Button type="submit" disabled={saving || storeName.trim() === store.name}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
