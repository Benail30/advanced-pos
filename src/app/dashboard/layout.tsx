'use client';

import AuthenticatedLayout from '@/components/layouts/authenticated-layout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
} 