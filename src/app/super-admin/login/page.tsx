'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function safeRedirect(url: string | null, fallback: string): string {
  if (url && url.startsWith('/') && !url.startsWith('//')) return url;
  return fallback;
}

function SuperAdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeRedirect(searchParams.get('callbackUrl'), '/super-admin/dashboard');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError('Invalid credentials');
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <Link
        href="/"
        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold text-center text-white">
            Super Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-400"
              />
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-600 hover:bg-slate-500 text-white"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Suspense fallback={<div className="w-full max-w-sm h-64 bg-slate-800 rounded-lg animate-pulse" />}>
        <SuperAdminLoginForm />
      </Suspense>
    </div>
  );
}
