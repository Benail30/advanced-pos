import { PowerBIAuth } from './auth';

// Define interface for the embed config
export interface PowerBIEmbedConfig {
  type: 'report' | 'dashboard' | 'tile';
  id: string;
  reportId?: string;
  workspaceId?: string;
  embedUrl: string;
  accessToken: string;
  tokenType: 'Embed' | 'Aad';
  filterPaneEnabled?: boolean;
  navContentPaneEnabled?: boolean;
  settings?: {
    filterPaneEnabled?: boolean;
    navContentPaneEnabled?: boolean;
    localeSettings?: {
      language: string;
      formatLocale: string;
    };
  };
}

// PowerBI client class to handle authentication and token generation
export class PowerBIClient {
  private clientId: string;
  private clientSecret: string;
  private tenantId: string;
  private workspaceId: string;
  private reportId: string;
  private redirectUri: string;
  private auth: PowerBIAuth;

  constructor() {
    // Get configuration from environment variables
    this.clientId = process.env.POWER_BI_CLIENT_ID || '';
    this.clientSecret = process.env.POWER_BI_CLIENT_SECRET || '';
    this.tenantId = process.env.POWER_BI_TENANT_ID || '';
    this.workspaceId = process.env.POWER_BI_WORKSPACE_ID || '';
    this.reportId = process.env.POWER_BI_REPORT_ID || '';
    this.redirectUri = process.env.POWER_BI_REDIRECT_URI || '';

    // Validate configuration
    this.validateConfig();
    
    // Initialize auth service
    this.auth = new PowerBIAuth();
  }

  private validateConfig(): void {
    const requiredVars = [
      { name: 'POWER_BI_CLIENT_ID', value: this.clientId },
      { name: 'POWER_BI_CLIENT_SECRET', value: this.clientSecret },
      { name: 'POWER_BI_TENANT_ID', value: this.tenantId },
      { name: 'POWER_BI_WORKSPACE_ID', value: this.workspaceId },
      { name: 'POWER_BI_REDIRECT_URI', value: this.redirectUri },
    ];

    const missingVars = requiredVars.filter(({ value }) => !value);
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required Power BI configuration: ${missingVars
          .map(({ name }) => name)
          .join(', ')}`
      );
    }
  }

  public isConfigured(): boolean {
    return Boolean(
      this.clientId &&
      this.clientSecret &&
      this.tenantId &&
      this.workspaceId &&
      this.redirectUri
    );
  }

  // Get the embed configuration for a report
  public async getReportEmbedConfig(
    reportId: string = this.reportId,
    workspaceId: string = this.workspaceId,
    filterPaneEnabled = true,
    navContentPaneEnabled = true
  ): Promise<PowerBIEmbedConfig> {
    try {
      if (!reportId || !workspaceId) {
        throw new Error('Report ID and Workspace ID are required');
      }

      const embedToken = await this.auth.getEmbedToken(reportId, workspaceId);
      
      return {
        type: 'report',
        id: reportId,
        reportId,
        workspaceId,
        embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${workspaceId}`,
        accessToken: embedToken,
        tokenType: 'Embed',
        filterPaneEnabled,
        navContentPaneEnabled,
        settings: {
          filterPaneEnabled,
          navContentPaneEnabled,
          localeSettings: {
            language: 'en',
            formatLocale: 'en-US',
          },
        },
      };
    } catch (error) {
      console.error('Error getting report embed config:', error);
      throw error;
    }
  }

  public async checkReportAccess(reportId: string, workspaceId: string): Promise<boolean> {
    try {
      await this.auth.getEmbedToken(reportId, workspaceId);
      return true;
    } catch (error) {
      console.error('Error checking report access:', error);
      return false;
    }
  }
} 