import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminSidebar } from '@/app/dashboard/components/admin-sidebar';

export default async function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        userName={session.user.name ?? session.user.email}
        userEmail={session.user.email}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center px-6 shrink-0">
          <p className="text-sm text-gray-500">
            Signed in as <span className="font-medium text-gray-900">{session.user.email}</span>
          </p>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
