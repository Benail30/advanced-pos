import AdminLayout from '@/components/layouts/admin-layout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
} 