import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'admin' | 'cashier';

interface UseRoleReturn {
  role: Role | null;
  isLoading: boolean;
  isAdmin: boolean;
  isCashier: boolean;
  canAccess: (allowedRoles: Role[]) => boolean;
}

export function useRole(): UseRoleReturn {
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }

        const data = await response.json();
        if (!data.user?.email) {
          router.push('/login');
          return;
        }

        // Determine role based on email
        const userRole: Role = 
          data.user.email === 'benalighassen30@gmail.com' || 
          data.user.email === 'admin@example.com'
            ? 'admin'
            : 'cashier';

        setRole(userRole);
      } catch (error) {
        console.error('Error checking role:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, [router]);

  return {
    role,
    isLoading,
    isAdmin: role === 'admin',
    isCashier: role === 'cashier',
    canAccess: (allowedRoles: Role[]) => role !== null && allowedRoles.includes(role),
  };
} 