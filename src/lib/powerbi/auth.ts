import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';
import { ClientSecretCredential } from '@azure/identity';

export class PowerBIAuth {
  private msalClient: ConfidentialClientApplication;
  private credential: ClientSecretCredential;

  constructor() {
    const clientId = process.env.POWER_BI_CLIENT_ID;
    const clientSecret = process.env.POWER_BI_CLIENT_SECRET;
    const tenantId = process.env.POWER_BI_TENANT_ID;

    if (!clientId || !clientSecret || !tenantId) {
      throw new Error('Power BI authentication configuration is missing');
    }

    // Initialize MSAL client
    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId,
        clientSecret,
        authority: `https://login.microsoftonline.com/${tenantId}`,
      },
    });

    // Initialize Azure credential
    this.credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  }

  async getAccessToken(): Promise<AuthenticationResult> {
    try {
      const scopes = ['https://analysis.windows.net/powerbi/api/.default'];
      const result = await this.msalClient.acquireTokenByClientCredential({
        scopes,
      });

      if (!result) {
        throw new Error('Failed to acquire access token');
      }

      return result;
    } catch (error) {
      console.error('Error acquiring Power BI access token:', error);
      throw error;
    }
  }

  async getEmbedToken(reportId: string, workspaceId: string): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(
        `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessLevel: 'View',
            allowSaveAs: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate embed token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error generating Power BI embed token:', error);
      throw error;
    }
  }
} 