import { ClientSecretCredential } from '@azure/identity';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

interface PowerBIReport {
  id: string;
  name: string;
  embedUrl?: string;
  webUrl?: string;
}

interface PowerBIWorkspace {
  id: string;
  name: string;
  type?: string;
  state?: string;
}

interface PowerBIConfig {
  workspaceId: string;
  reportIds: {
    sales: string;
    customers: string;
    inventory: string;
    trends: string;
  };
  accessToken: string;
}

async function getAccessToken(credential: ClientSecretCredential): Promise<string> {
  try {
    const token = await credential.getToken('https://analysis.windows.net/powerbi/api/.default');
    if (!token.token) {
      throw new Error('Failed to generate access token');
    }
    return token.token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw error;
  }
}

async function updateEnvFile(config: PowerBIConfig): Promise<void> {
  try {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    // Create or update Power BI configuration
    const envVars = {
      NEXT_PUBLIC_POWERBI_WORKSPACE_ID: config.workspaceId,
      NEXT_PUBLIC_POWERBI_ACCESS_TOKEN: config.accessToken,
      NEXT_PUBLIC_POWERBI_SALES_REPORT_ID: config.reportIds.sales,
      NEXT_PUBLIC_POWERBI_CUSTOMERS_REPORT_ID: config.reportIds.customers,
      NEXT_PUBLIC_POWERBI_INVENTORY_REPORT_ID: config.reportIds.inventory,
      NEXT_PUBLIC_POWERBI_TRENDS_REPORT_ID: config.reportIds.trends
    };

    Object.entries(envVars).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;
      
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${newLine}`;
      }
    });

    fs.writeFileSync(envPath, envContent.trim() + '\n');
  } catch (error) {
    console.error('Error updating .env file:', error);
    throw error;
  }
}

async function getPowerBIReports(accessToken: string, workspaceId: string): Promise<PowerBIReport[]> {
  try {
    const response = await fetch(`https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching Power BI reports:', error);
    throw error;
  }
}

async function getPowerBIWorkspaces(accessToken: string): Promise<PowerBIWorkspace[]> {
  try {
    const response = await fetch('https://api.powerbi.com/v1.0/myorg/groups', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workspaces: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching Power BI workspaces:', error);
    throw error;
  }
}

async function main() {
  console.log('Starting Power BI setup...\n');

  // Check if required environment variables are set
  const requiredEnvVars = [
    'POWERBI_CLIENT_ID',
    'POWERBI_CLIENT_SECRET',
    'POWERBI_TENANT_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    console.log('\nPlease add these variables to your .env file:');
    console.log(`
POWERBI_CLIENT_ID=your_client_id
POWERBI_CLIENT_SECRET=your_client_secret
POWERBI_TENANT_ID=your_tenant_id
    `);
    process.exit(1);
  }

  try {
    // Create credentials
    const credential = new ClientSecretCredential(
      process.env.POWERBI_TENANT_ID!,
      process.env.POWERBI_CLIENT_ID!,
      process.env.POWERBI_CLIENT_SECRET!
    );

    // Generate access token
    console.log('Generating access token...');
    const accessToken = await getAccessToken(credential);

    // Get workspaces
    console.log('\nFetching workspaces...');
    const workspaces = await getPowerBIWorkspaces(accessToken);
    
    if (!workspaces || workspaces.length === 0) {
      throw new Error('No workspaces found. Please create a workspace in Power BI first.');
    }

    // Display workspaces
    console.log('\nAvailable workspaces:');
    workspaces.forEach((workspace: PowerBIWorkspace, index: number) => {
      console.log(`${index + 1}. ${workspace.name} (ID: ${workspace.id})`);
    });

    // Get reports for the first workspace
    const workspaceId = workspaces[0].id;
    console.log(`\nFetching reports for workspace: ${workspaces[0].name}`);
    
    const reports = await getPowerBIReports(accessToken, workspaceId);
    
    if (!reports || reports.length === 0) {
      throw new Error('No reports found in the workspace. Please create or import reports first.');
    }

    // Display reports
    console.log('\nAvailable reports:');
    reports.forEach((report: PowerBIReport, index: number) => {
      console.log(`${index + 1}. ${report.name} (ID: ${report.id})`);
    });

    // Prepare configuration
    const config: PowerBIConfig = {
      workspaceId,
      reportIds: {
        sales: reports[0]?.id || '',
        customers: reports[1]?.id || '',
        inventory: reports[2]?.id || '',
        trends: reports[3]?.id || ''
      },
      accessToken
    };

    // Update .env file
    console.log('\nUpdating .env file...');
    await updateEnvFile(config);

    console.log('\nPower BI configuration updated successfully!');
    console.log('\nNext steps:');
    console.log('1. Restart your Next.js development server');
    console.log('2. Visit http://localhost:3000/dashboard/reports to see your Power BI reports');

  } catch (error) {
    console.error('\nError:', error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 