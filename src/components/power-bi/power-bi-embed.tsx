'use client';

import { useEffect, useRef, useState } from 'react';
import { models, service, factories, IEmbedConfiguration, Embed } from 'powerbi-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0/client';

interface PowerBIEmbedProps {
  className?: string;
  reportName?: string;
  filterPaneEnabled?: boolean;
  navContentPaneEnabled?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UserWithRoles {
  'https://your-app/roles'?: string[];
}

export function PowerBIEmbed({
  className = '',
  reportName = 'Sales Dashboard',
  filterPaneEnabled = false,
  navContentPaneEnabled = true,
  refreshInterval = 300000, // 5 minutes default
}: PowerBIEmbedProps) {
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportInstance, setReportInstance] = useState<Embed | null>(null);
  const [powerbi, setPowerbi] = useState<service.Service | null>(null);
  const { user, error: authError } = useUser();

  useEffect(() => {
    // Check if user is authorized
    if (authError || !user) {
      setError('Authentication required to view this dashboard');
      setLoading(false);
      return;
    }

    // Check if user has admin role
    const userWithRoles = user as UserWithRoles;
    const roles = userWithRoles['https://your-app/roles'] || [];
    if (!roles.includes('admin')) {
      setError('You do not have permission to view this dashboard');
      setLoading(false);
      return;
    }

    // Initialize the Power BI service
    const pbiService = new service.Service(
      factories.hpmFactory, 
      factories.wpmpFactory, 
      factories.routerFactory
    );
    setPowerbi(pbiService);

    // Function to fetch the embed config from the API
    async function fetchEmbedConfig() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/powerbi/embed-config?filterPane=${filterPaneEnabled}&navPane=${navContentPaneEnabled}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch Power BI embed configuration');
        }

        const embedConfig = await response.json();
        return embedConfig;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Failed to load Power BI report: ${errorMessage}`);
        return null;
      } finally {
        setLoading(false);
      }
    }

    // Function to embed the Power BI report
    async function embedReport() {
      if (!reportContainerRef.current || !pbiService) return;

      try {
        // Get the embed configuration
        const embedConfig = await fetchEmbedConfig();
        if (!embedConfig) return;

        // Embed the report
        const reportContainer = reportContainerRef.current;
        const reportConfig: IEmbedConfiguration = {
          type: 'report',
          id: process.env.NEXT_PUBLIC_POWERBI_REPORT_ID || '',
          embedUrl: process.env.NEXT_PUBLIC_POWERBI_REPORT_EMBED_URL || '',
          accessToken: embedConfig.accessToken,
          tokenType: models.TokenType.Aad,
          settings: {
            filterPaneEnabled: embedConfig.settings?.filterPaneEnabled ?? false,
            navContentPaneEnabled: embedConfig.settings?.navContentPaneEnabled ?? true,
            localeSettings: {
              language: 'en',
              formatLocale: 'en-US',
            },
            background: models.BackgroundType.Transparent,
          },
        };

        // Embed the report and set the report object in state
        const report = pbiService.embed(reportContainer, reportConfig);
        setReportInstance(report);

        // Handle report events
        report.on('loaded', () => {
          console.log('Power BI Report loaded');
          setLoading(false);
        });

        report.on('error', (event: any) => {
          console.error('Power BI Report error:', event.detail);
          setError(`Report error: ${event.detail?.message || 'Unknown error'}`);
          setLoading(false);
        });

        // Set up real-time updates
        if (refreshInterval > 0) {
          const refreshTimer = setInterval(async () => {
            try {
              const newConfig = await fetchEmbedConfig();
              if (newConfig) {
                await report.reload();
              }
            } catch (error) {
              console.error('Failed to refresh report:', error);
            }
          }, refreshInterval);

          return () => clearInterval(refreshTimer);
        }

        // Cleanup function
        return () => {
          if (report) {
            report.off('loaded');
            report.off('error');
            pbiService.reset(reportContainer);
          }
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Failed to embed Power BI report: ${errorMessage}`);
        setLoading(false);
      }
    }

    // Embed the report
    embedReport();

    // Cleanup function
    return () => {
      const container = reportContainerRef.current;
      if (reportInstance) {
        reportInstance.off('loaded');
        reportInstance.off('error');
        if (container && powerbi) {
          powerbi.reset(container);
        }
      }
    };
  }, [filterPaneEnabled, navContentPaneEnabled, powerbi, reportInstance, refreshInterval, user, authError]);

  return (
    <div className={`flex flex-col w-full h-full ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{reportName}</h2>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative w-full flex-grow rounded-lg overflow-hidden border border-gray-200 bg-white">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        )}
        <div
          ref={reportContainerRef}
          className="w-full h-full min-h-[500px]"
        />
      </div>
    </div>
  );
} 