'use client';

import { PowerBIIframe } from '@/components/power-bi/power-bi-iframe';
import { ExportButton } from '@/components/export/export-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function ReportsPage() {
  const { user, error: authError } = useUser();

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600">Please try logging in again.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-4">
          <ExportButton type="sales" label="Export Sales Data" />
          <ExportButton type="inventory" label="Export Inventory Data" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <PowerBIIframe
            reportId={process.env.NEXT_PUBLIC_POWER_BI_REPORT_ID || ''}
            workspaceId={process.env.NEXT_PUBLIC_POWER_BI_WORKSPACE_ID || ''}
            height="600px"
            filterPaneEnabled={true}
            navContentPaneEnabled={true}
          />
        </CardContent>
      </Card>
    </div>
  );
} 