'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Users, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CashierLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user: auth0User } = useUser();
  const { login } = useAuth();
  const router = useRouter();

  // If already authenticated with Auth0, redirect to admin
  if (auth0User) {
    router.push('/');
    return null;
  }

  /**
   * HANDLE LOGIN FUNCTION
   * 
   * This function runs when the cashier submits the login form.
   * It validates their credentials and redirects them to the POS system if successful.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Starting cashier login process
    const result = await login(email, password);
    
    // Check if login was successful
    if (result.success) {
      // Login successful! Redirecting to POS system
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        router.push('/pos');
      }, 250);
    } else {
      // Login failed - show error message to user
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Back to main login */}
        <div className="mb-6">
          <Link 
            href="/login" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to main login
          </Link>
        </div>

        {/* Cashier Login Card */}
        <Card className="p-8 bg-white shadow-xl border-0">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cashier Login</h1>
            <p className="text-gray-600">Access your POS system</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">For Cashiers Only</span>
              </div>
              <p className="text-sm text-green-700">
                Enter your email and password to access the POS system.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@company.com"
                required
                className="w-full"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pr-10"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                <>
                  <Users className="w-5 h-5 mr-2" />
                  Sign in to POS
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact your administrator
            </p>
          </div>
        </Card>

        {/* Admin link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Are you an administrator?{' '}
            <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
              Use Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 