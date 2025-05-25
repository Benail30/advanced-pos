'use client';
import { useEffect, useRef } from 'react';
import { models, Report, Embed, IEmbedConfiguration } from 'powerbi-client';
import { PowerBIEmbed } from 'powerbi-client-react';

interface DashboardEmbedProps {
  embedUrl: string;
  accessToken: string;
  reportId: string;
}

export function DashboardEmbed({ embedUrl, accessToken, reportId }: DashboardEmbedProps) {
  const reportRef = useRef<Report | null>(null);

  useEffect(() => {
    if (reportRef.current) {
      reportRef.current.on('loaded', () => {
        console.log('Report loaded');
      });
    }
  }, []);

  const embedConfig: IEmbedConfiguration = {
    type: 'report',
    tokenType: models.TokenType.Embed,
    accessToken,
    embedUrl,
    id: reportId,
    permissions: models.Permissions.All,
    settings: {
      filterPaneEnabled: true,
      navContentPaneEnabled: true,
      panes: {
        filters: { visible: true },
        pageNavigation: { visible: true },
      },
      layoutType: models.LayoutType.Custom,
      customLayout: {
        displayOption: models.DisplayOption.FitToWidth,
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[600px]">
      <PowerBIEmbed
        embedConfig={embedConfig}
        eventHandlers={
          new Map([
            ['loaded', () => console.log('Report loaded')],
            ['rendered', () => console.log('Report rendered')],
            ['error', (event: any) => console.error(event?.detail)],
          ])
        }
        cssClassName="report-container"
        getEmbeddedComponent={(embeddedReport: Embed) => {
          reportRef.current = embeddedReport as Report;
        }}
      />
    </div>
  );
} 