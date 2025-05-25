import { useUser } from '@auth0/nextjs-auth0/client';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isLoading } = useUser();
  const userRole = user?.['https://your-app/roles']?.[0] || 'cashier';

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(userRole)) {
    return fallback || null;
  }

  return <>{children}</>;
} 