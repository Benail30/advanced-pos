import { AxiosError } from 'axios';

export type Auth0ErrorType = 
  | 'invalid_credentials'
  | 'invalid_request'
  | 'unauthorized_client'
  | 'access_denied'
  | 'unsupported_response_type'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'invalid_client'
  | 'invalid_grant'
  | 'unsupported_grant_type'
  | 'invalid_token'
  | 'unknown_error';

export interface Auth0Error {
  type: Auth0ErrorType;
  message: string;
  statusCode?: number;
  details?: any;
}

export function handleAuth0Error(error: unknown): Auth0Error {
  if (error instanceof AxiosError) {
    const response = error.response;
    
    if (response?.data?.error) {
      const errorType = response.data.error as Auth0ErrorType;
      return {
        type: errorType,
        message: response.data.error_description || response.data.message || 'Authentication failed',
        statusCode: response.status,
        details: response.data
      };
    }

    if (response?.status === 401) {
      return {
        type: 'unauthorized_client',
        message: 'Unauthorized access',
        statusCode: 401,
        details: response.data
      };
    }

    if (response?.status === 403) {
      return {
        type: 'access_denied',
        message: 'Access denied',
        statusCode: 403,
        details: response.data
      };
    }
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    return {
      type: 'unknown_error',
      message: error.message,
      details: error
    };
  }

  return {
    type: 'unknown_error',
    message: 'An unexpected error occurred',
    details: error
  };
}

// Example usage:
// try {
//   await login();
// } catch (error) {
//   const authError = handleAuth0Error(error);
//   console.error(`Auth Error: ${authError.type}`, authError.message);
//   // Handle specific error types
//   switch (authError.type) {
//     case 'invalid_credentials':
//       // Handle invalid credentials
//       break;
//     case 'access_denied':
//       // Handle access denied
//       break;
//     // ... handle other error types
//   }
// } 