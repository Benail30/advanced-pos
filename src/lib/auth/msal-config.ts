import { PublicClientApplication, Configuration, AccountInfo, AuthenticationResult } from '@azure/msal-browser';

// MSAL configuration
const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_POWER_BI_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_POWER_BI_TENANT_ID}`,
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    allowNativeBroker: false,
    hashNavigationEnabled: true,
    loggerOptions: {
      loggerCallback: (level: number, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0:
            console.error(message);
            return;
          case 1:
            console.warn(message);
            return;
          case 2:
            console.info(message);
            return;
          case 3:
            console.debug(message);
            return;
          case 4:
            console.verbose(message);
            return;
          default:
            return;
        }
      },
      piiLoggingEnabled: false,
      logLevel: 3,
    },
  },
};

// Power BI scopes
export const powerBIScopes = {
  scopes: ['https://analysis.windows.net/powerbi/api/.default'],
};

// Initialize MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Helper function to get active account
export const getActiveAccount = (): AccountInfo | null => {
  const activeAccount = msalInstance.getActiveAccount();
  if (activeAccount) {
    return activeAccount;
  }

  // If no active account, try to get the first account
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
    return accounts[0];
  }

  return null;
};

// Helper function to handle redirect promise
export const handleRedirectPromise = async (): Promise<AuthenticationResult | null> => {
  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      msalInstance.setActiveAccount(response.account);
    }
    return response;
  } catch (error) {
    console.error('Error handling redirect:', error);
    return null;
  }
};

// Helper function to acquire token silently
export const acquireTokenSilent = async (): Promise<string | null> => {
  try {
    const account = getActiveAccount();
    if (!account) {
      return null;
    }

    const response = await msalInstance.acquireTokenSilent({
      ...powerBIScopes,
      account,
    });

    return response.accessToken;
  } catch (error) {
    console.error('Error acquiring token silently:', error);
    return null;
  }
}; 