'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simple validation
    if (!name || !email || !password) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Create user data - in a real app, this would be stored in a database
      const userData = {
        id: 'user_' + Date.now(),
        name,
        email,
        isLoggedIn: true
      };
      
      // Store user info in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      // Redirect to POS page
      router.push('/pos');
    } catch (error: any) {
      setError('Failed to register. Please try again.');
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Register</h1>
          <p className="mt-2 text-gray-600">
            Create an account to get started
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
          <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
              <input
              id="name"
                name="name"
              type="text"
                autoComplete="name"
              required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="relative block w-full rounded-md border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Full Name"
            />
          </div>
          <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
            </label>
              <input
                id="email-address"
                name="email"
              type="email"
                autoComplete="email"
              required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full rounded-md border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Email address"
            />
          </div>
          <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
              <input
              id="password"
                name="password"
              type="password"
                autoComplete="new-password"
              required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-md border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Password"
            />
          </div>
          <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
              <input
                id="confirm-password"
                name="confirmPassword"
              type="password"
                autoComplete="new-password"
              required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="relative block w-full rounded-md border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 