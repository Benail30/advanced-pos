import axios from 'axios';
import { handleAuth0Error, Auth0Error } from './error-handler';

interface LoginCredentials {
  email: string;
  password: string;
}

export async function loginWithCredentials(credentials: LoginCredentials): Promise<void> {
  try {
    const response = await axios.post('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    const authError = handleAuth0Error(error);
    console.error('Login failed:', authError);
    throw authError;
  }
}

export async function handleLoginError(error: Auth0Error): Promise<string> {
  switch (error.type) {
    case 'invalid_credentials':
      return 'Invalid email or password. Please try again.';
    case 'access_denied':
      return 'Access denied. Please contact support.';
    case 'unauthorized_client':
      return 'Unauthorized access. Please try logging in again.';
    case 'server_error':
      return 'Server error. Please try again later.';
    case 'temporarily_unavailable':
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
} 