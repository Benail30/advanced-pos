import { DashboardEmbed } from '@/components/power-bi/dashboard-embed';

export default function ReportsPage() {
  // These values should come from your environment variables or API
  const embedUrl = process.env.NEXT_PUBLIC_POWERBI_EMBED_URL || '';
  const accessToken = process.env.NEXT_PUBLIC_POWERBI_ACCESS_TOKEN || '';
  const reportId = process.env.NEXT_PUBLIC_POWERBI_REPORT_ID || '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales Analytics Dashboard</h1>
        <p className="text-gray-500">View your sales performance and analytics</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <DashboardEmbed
          embedUrl={embedUrl}
          accessToken={accessToken}
          reportId={reportId}
        />
      </div>
    </div>
  );
} 