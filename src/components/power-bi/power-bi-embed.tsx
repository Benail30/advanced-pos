'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Maximize2, Minimize2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface PowerBIEmbedProps {
  reportId: string;
  workspaceId?: string;
  accessToken?: string;
  height?: string | number;
  title?: string;
  className?: string;
}

interface ConfigError {
  type: 'missing' | 'invalid' | 'loading' | 'network';
  message: string;
}

export function PowerBIEmbed({
  reportId,
  workspaceId = process.env.NEXT_PUBLIC_POWERBI_WORKSPACE_ID,
  accessToken = process.env.NEXT_PUBLIC_POWERBI_ACCESS_TOKEN,
  height = '600px',
  title,
  className,
}: PowerBIEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ConfigError | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [availableFilters, setAvailableFilters] = useState<any[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const validateConfiguration = useCallback(() => {
    if (!reportId) {
      return { type: 'missing' as const, message: 'Report ID is missing. Please check your environment variables.' };
    }
    if (!workspaceId) {
      return { type: 'missing' as const, message: 'Workspace ID is missing. Please check your environment variables.' };
    }
    if (!accessToken) {
      return { type: 'missing' as const, message: 'Access token is missing. Please check your environment variables.' };
    }
    if (reportId === 'your_report_id_here' || workspaceId === 'your_workspace_id_here') {
      return { type: 'invalid' as const, message: 'Default placeholder values detected. Please configure your Power BI settings.' };
    }
    return null;
  }, [reportId, workspaceId, accessToken]);

  const toggleFullscreen = useCallback(() => {
    if (!cardRef.current) return;

    if (!isFullscreen) {
      if (cardRef.current.requestFullscreen) {
        cardRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const configError = validateConfiguration();
    if (configError) {
      setError(configError);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      // Simulate fetching available filters
      setAvailableFilters([
        { id: 'date', name: 'Date Range', type: 'dateRange' },
        { id: 'category', name: 'Category', type: 'multiSelect' },
        { id: 'region', name: 'Region', type: 'multiSelect' },
      ]);
    }, 1500);

    return () => clearTimeout(timer);
  }, [validateConfiguration]);

  const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${workspaceId}`;

  const handleIframeError = () => {
    setError({
      type: 'network' as const,
      message: 'Failed to load Power BI report. Please check your network connection and Power BI service status.',
    });
    setIsLoading(false);
  };

  const applyFilter = useCallback((filterId: string, value: any) => {
    if (!iframeRef.current?.contentWindow) return;
    
    // Send message to Power BI iframe to apply filter
    iframeRef.current.contentWindow.postMessage({
      action: 'applyFilter',
      filterId,
      value,
    }, '*');
  }, []);

  return (
    <Card className={className} ref={cardRef}>
      <CardContent className="relative p-0 overflow-hidden">
        <div className="absolute top-2 right-2 z-20 flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Open filters</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Report Filters</SheetTitle>
                <SheetDescription>
                  Apply filters to customize your view
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {availableFilters.map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <label className="text-sm font-medium">{filter.name}</label>
                    {filter.type === 'dateRange' && (
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                          onChange={(e) => applyFilter(filter.id, { start: e.target.value })}
                        />
                        <input
                          type="date"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                          onChange={(e) => applyFilter(filter.id, { end: e.target.value })}
                        />
                      </div>
                    )}
                    {filter.type === 'multiSelect' && (
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                        onChange={(e) => applyFilter(filter.id, e.target.value)}
                      >
                        <option value="">Select {filter.name}</option>
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            </span>
          </Button>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading report...</p>
          </div>
        )}
        
        {error && (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {error.message}
                {error.type === 'missing' && (
                  <p className="mt-2 text-sm">
                    Run the Power BI setup script to configure your environment:
                    <code className="ml-2 p-1 bg-muted rounded">npm run powerbi:setup</code>
                  </p>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {!error && (
          <iframe
            ref={iframeRef}
            title={title || `Power BI Report ${reportId}`}
            width="100%"
            height={height}
            src={embedUrl}
            frameBorder="0"
            allowFullScreen
            onError={handleIframeError}
            style={{
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
        )}
      </CardContent>
    </Card>
  );
} 