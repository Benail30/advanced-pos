"use client";
import { ReactNode } from 'react';
import { useRole } from '@/hooks/useRole';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface RoleLayoutProps {
  children: ReactNode;
  allowedRoles: ('admin' | 'cashier')[];
}

export function RoleLayout({ children, allowedRoles }: RoleLayoutProps) {
  const { role, isLoading, canAccess } = useRole();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!role || !canAccess(allowedRoles)) {
    // Redirect to appropriate home page based on role
    const homePage = role === 'admin' ? '/admin' : '/pos';
    router.push(homePage);
    return null;
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleLayout allowedRoles={['admin']}>{children}</RoleLayout>;
}

export function CashierLayout({ children }: { children: ReactNode }) {
  return <RoleLayout allowedRoles={['cashier']}>{children}</RoleLayout>;
}

export function AdminOrCashierLayout({ children }: { children: ReactNode }) {
  return <RoleLayout allowedRoles={['admin', 'cashier']}>{children}</RoleLayout>;
} 