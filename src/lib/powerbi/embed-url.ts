import { PowerBIEmbedConfig } from './client';

export function generateEmbedUrl({
  reportId,
  workspaceId,
  filterPaneEnabled = true,
  navContentPaneEnabled = true,
}: {
  reportId: string;
  workspaceId: string;
  filterPaneEnabled?: boolean;
  navContentPaneEnabled?: boolean;
}): string {
  // Base URL for Power BI embedding
  const baseUrl = 'https://app.powerbi.com/reportEmbed';
  
  // Query parameters
  const params = new URLSearchParams({
    reportId: reportId || '',
    groupId: workspaceId || '',
    config: JSON.stringify({
      filterPaneEnabled,
      navContentPaneEnabled,
      background: 'transparent',
      pageView: 'fitToWidth',
      locale: 'en-US',
    }),
  });

  // Construct the full embed URL
  return `${baseUrl}?${params.toString()}`;
}

export function getReportEmbedConfig(
  reportId: string,
  workspaceId: string,
  accessToken: string,
  options: {
    filterPaneEnabled?: boolean;
    navContentPaneEnabled?: boolean;
  } = {}
): PowerBIEmbedConfig {
  return {
    type: 'report',
    id: reportId,
    embedUrl: generateEmbedUrl({
      reportId,
      workspaceId,
      filterPaneEnabled: options.filterPaneEnabled ?? true,
      navContentPaneEnabled: options.navContentPaneEnabled ?? true,
    }),
    accessToken,
    tokenType: 'Embed',
    settings: {
      filterPaneEnabled: options.filterPaneEnabled ?? true,
      navContentPaneEnabled: options.navContentPaneEnabled ?? true,
      localeSettings: {
        language: 'en',
        formatLocale: 'en-US',
      },
    },
  };
} 