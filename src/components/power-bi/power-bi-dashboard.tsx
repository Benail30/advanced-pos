'use client';

import { useEffect, useRef, useState } from 'react';
import { models, service, factories, IEmbedConfiguration, Embed } from 'powerbi-client';
import { msalInstance, powerBIScopes, getActiveAccount } from '@/lib/auth/msal-config';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0/client';

interface PowerBIDashboardProps {
  reportId: string;
  workspaceId: string;
  className?: string;
  reportName?: string;
  filterPaneEnabled?: boolean;
  navContentPaneEnabled?: boolean;
  refreshInterval?: number;
}

export function PowerBIDashboard({
  reportId,
  workspaceId,
  className = '',
  reportName = 'Power BI Dashboard',
  filterPaneEnabled = false,
  navContentPaneEnabled = true,
  refreshInterval = 300000, // 5 minutes default
}: PowerBIDashboardProps) {
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
    const roles = user['https://your-app/roles'] || [];
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

    // Function to get access token using MSAL
    async function getAccessToken() {
      try {
        const account = getActiveAccount();
        if (!account) {
          // If no account is found, initiate login
          await msalInstance.loginRedirect(powerBIScopes);
          return null;
        }

        // Get token silently
        const response = await msalInstance.acquireTokenSilent({
          ...powerBIScopes,
          account,
        });

        return response.accessToken;
      } catch (error) {
        console.error('Error getting access token:', error);
        // If silent token acquisition fails, try interactive login
        await msalInstance.loginRedirect(powerBIScopes);
        return null;
      }
    }

    // Function to embed the Power BI report
    async function embedReport() {
      if (!reportContainerRef.current || !pbiService) return;

      try {
        setLoading(true);
        setError(null);

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) return;

        // Create embed configuration
        const reportConfig: IEmbedConfiguration = {
          type: 'report',
          id: reportId,
          embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${workspaceId}`,
          accessToken,
          tokenType: models.TokenType.Aad,
          settings: {
            filterPaneEnabled,
            navContentPaneEnabled,
            localeSettings: {
              language: 'en',
              formatLocale: 'en-US',
            },
            background: models.BackgroundType.Transparent,
          },
        };

        // Embed the report
        const reportContainer = reportContainerRef.current;
        const embeddedReport = pbiService.embed(reportContainer, reportConfig);
        setReportInstance(embeddedReport);

        // Handle report events
        embeddedReport.on('loaded', () => {
          console.log('Power BI Report loaded');
          setLoading(false);
        });

        embeddedReport.on('error', (event: any) => {
          console.error('Power BI Report error:', event.detail);
          setError(`Report error: ${event.detail?.message || 'Unknown error'}`);
          setLoading(false);
        });

        // Set up real-time updates
        if (refreshInterval > 0) {
          const refreshTimer = setInterval(async () => {
            try {
              const newToken = await getAccessToken();
              if (newToken) {
                await embeddedReport.reload();
              }
            } catch (error) {
              console.error('Failed to refresh report:', error);
            }
          }, refreshInterval);

          return () => clearInterval(refreshTimer);
        }

        // Cleanup function
        return () => {
          if (embeddedReport) {
            embeddedReport.off('loaded');
            embeddedReport.off('error');
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
  }, [reportId, workspaceId, filterPaneEnabled, navContentPaneEnabled, refreshInterval, user, authError, powerbi, reportInstance]);

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