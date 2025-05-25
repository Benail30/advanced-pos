import { PowerBIEmbed } from '@/components/admin/PowerBIEmbed';
import { format } from 'date-fns';

// TODO: Replace with actual Power BI report IDs and URLs
const DASHBOARDS = [
  {
    id: 'sales-dashboard',
    reportId: 'placeholder-sales-report-id',
    embedUrl: 'https://app.powerbi.com/reportEmbed',
    title: 'Sales Analytics',
    lastUpdated: format(new Date(), 'MMM d, yyyy h:mm a'),
  },
  {
    id: 'inventory-dashboard',
    reportId: 'placeholder-inventory-report-id',
    embedUrl: 'https://app.powerbi.com/reportEmbed',
    title: 'Inventory Analytics',
    lastUpdated: format(new Date(), 'MMM d, yyyy h:mm a'),
  },
  {
    id: 'customer-dashboard',
    reportId: 'placeholder-customer-report-id',
    embedUrl: 'https://app.powerbi.com/reportEmbed',
    title: 'Customer Analytics',
    lastUpdated: format(new Date(), 'MMM d, yyyy h:mm a'),
  },
  {
    id: 'performance-dashboard',
    reportId: 'placeholder-performance-report-id',
    embedUrl: 'https://app.powerbi.com/reportEmbed',
    title: 'Performance Metrics',
    lastUpdated: format(new Date(), 'MMM d, yyyy h:mm a'),
  },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-gray-600">
            Real-time insights and analytics for your business
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {DASHBOARDS.map((dashboard) => (
            <PowerBIEmbed
              key={dashboard.id}
              reportId={dashboard.reportId}
              embedUrl={dashboard.embedUrl}
              title={dashboard.title}
              lastUpdated={dashboard.lastUpdated}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 