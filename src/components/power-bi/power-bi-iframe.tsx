'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0/client';

interface PowerBIIframeProps {
  reportId: string;
  workspaceId: string;
  className?: string;
  height?: string;
  filterPaneEnabled?: boolean;
  navContentPaneEnabled?: boolean;
}

export function PowerBIIframe({
  reportId,
  workspaceId,
  className = '',
  height = '500px',
  filterPaneEnabled = true,
  navContentPaneEnabled = true,
}: PowerBIIframeProps) {
  const { user, error: authError } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [embedUrl, setEmbedUrl] = useState<string>('');

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Check if the user has access to the report
        const response = await fetch('/api/powerbi/check-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reportId, workspaceId }),
        });

        if (!response.ok) {
          throw new Error('Failed to verify report access');
        }

        // Get the embed URL from the environment variable
        const baseUrl = process.env.NEXT_PUBLIC_POWER_BI_REPORT_EMBED_URL;
        if (!baseUrl) {
          throw new Error('Power BI report embed URL not configured');
        }

        setEmbedUrl(baseUrl);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Power BI report:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Power BI report');
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [reportId, workspaceId, user]);

  if (authError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Authentication error. Please try logging in again.</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <iframe
        title="Power BI Report"
        width="100%"
        height={height}
        src={embedUrl}
        frameBorder="0"
        allowFullScreen
        className="rounded-lg shadow-lg"
      />
    </div>
  );
} 