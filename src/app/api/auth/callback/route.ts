import { handleCallback } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export const GET = handleCallback();

export async function GET(req: NextRequest) {
  try {
    const res = await handleCallback(req);
    return res;
  } catch (error) {
    console.error('Callback error:', error);
    return new Response('Authentication callback failed', { status: 500 });
  }
} 