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

function CashierLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeRedirect(searchParams.get('callbackUrl'), '/pos');

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
        className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <Card>
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold text-center text-gray-900">
            Cashier Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="cashier@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-2 text-center text-sm text-gray-500">
            Admin?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Use admin login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CashierLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="w-full max-w-sm h-64 bg-white rounded-lg animate-pulse" />}>
        <CashierLoginForm />
      </Suspense>
    </div>
  );
}
