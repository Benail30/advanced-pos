import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to appropriate page based on role
    if (session?.user) {
      if (session.user.role === 'admin') {
        router.push('/admin');
      } else if (session.user.role === 'cashier') {
        router.push('/pos');
      }
    } else {
      router.push('/login');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You do not have permission to access this area.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Redirecting you to the appropriate page...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 