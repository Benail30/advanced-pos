'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserCircle, KeyRound, CheckCircle } from 'lucide-react';

export default function CashierSettingsPage() {
  const { data: session } = useSession();

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError(''); setPwSuccess(false);

    if (pwForm.next.length < 8) {
      setPwError('New password must be at least 8 characters'); return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('Passwords do not match'); return;
    }

    setPwBusy(true);
    const res = await fetch('/api/cashier/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
    });
    const data = await res.json();
    setPwBusy(false);

    if (!res.ok) { setPwError(data.error ?? 'Failed to update password'); return; }
    setPwSuccess(true);
    setPwForm({ current: '', next: '', confirm: '' });
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-gray-400" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Name</Label>
            <p className="text-sm font-medium text-gray-900">{session?.user?.name ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Email</Label>
            <p className="text-sm font-medium text-gray-900">{session?.user?.email}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Role</Label>
            <p className="text-sm font-medium text-gray-900">Cashier</p>
          </div>
        </CardContent>
      </Card>

      {/* Password change */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-gray-400" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current">Current Password</Label>
              <Input id="current" type="password" value={pwForm.current}
                onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next">New Password</Label>
              <Input id="next" type="password" value={pwForm.next}
                onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input id="confirm" type="password" value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
            </div>

            {pwError && <p className="text-sm text-red-500">{pwError}</p>}
            {pwSuccess && (
              <p className="text-sm text-green-600 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> Password updated successfully
              </p>
            )}

            <Button type="submit" disabled={pwBusy} className="w-full">
              {pwBusy ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
