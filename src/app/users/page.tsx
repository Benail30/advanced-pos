'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

type Cashier = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

const empty = { name: '', email: '', password: '' };

export default function UsersPage() {
  const { toast } = useToast();
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; editing: Cashier | null }>({ open: false, editing: null });
  const [form, setForm] = useState(empty);
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/users');
    const data = await res.json();
    setCashiers(data.success ? data.data : []);
    setLoading(false);
  }

  function openCreate() {
    setForm(empty);
    setFormError('');
    setShowPw(false);
    setDialog({ open: true, editing: null });
  }

  function openEdit(c: Cashier) {
    setForm({ name: c.name ?? '', email: c.email, password: '' });
    setFormError('');
    setShowPw(false);
    setDialog({ open: true, editing: c });
  }

  function closeDialog() {
    setDialog({ open: false, editing: null });
    setFormError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError('');

    const { editing } = dialog;
    const url = editing ? `/api/users/${editing.id}` : '/api/users';
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);

    if (!data.success) {
      setFormError(data.error ?? 'Operation failed');
      return;
    }

    toast({ title: editing ? 'Cashier updated' : 'Cashier created' });
    closeDialog();
    load();
  }

  async function handleDelete(c: Cashier) {
    if (!confirm(`Delete cashier ${c.name ?? c.email}? This cannot be undone.`)) return;
    const res = await fetch(`/api/users/${c.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      toast({ title: 'Cashier deleted' });
      setCashiers((prev) => prev.filter((x) => x.id !== c.id));
    } else {
      toast({ title: data.error ?? 'Failed to delete', variant: 'destructive' });
    }
  }

  const filtered = cashiers.filter(
    (c) =>
      (c.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cashiers</h1>
          <p className="text-sm text-gray-500 mt-1">{cashiers.length} cashier{cashiers.length !== 1 ? 's' : ''} in your store</p>
        </div>
        <Button onClick={openCreate} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Cashier
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search cashiers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-sm font-medium text-gray-900">
            {search ? 'No cashiers match your search' : 'No cashiers yet'}
          </p>
          {!search && (
            <p className="text-xs text-gray-500 mt-1">Click "Add Cashier" to create the first one.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{c.name ?? '—'}</p>
                <p className="text-sm text-gray-500">{c.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Added {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">Cashier</Badge>
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(c)}
                  className="text-red-500 hover:text-red-600 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.editing ? 'Edit Cashier' : 'Add Cashier'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password{dialog.editing && <span className="text-gray-400 font-normal"> (leave blank to keep current)</span>}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required={!dialog.editing}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : dialog.editing ? 'Save Changes' : 'Create Cashier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
