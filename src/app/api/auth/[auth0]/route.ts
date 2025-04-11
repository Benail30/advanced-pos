import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();
export const POST = handleAuth();

export async function POST(
  request: Request,
  context: { params: { auth0: string } }
) {
  try {
    const { auth0 } = await Promise.resolve(context.params);
    console.log('Auth route called:', auth0);
    console.log('Request URL:', request.url);
    return await handleAuth()(request, { params: { auth0 } });
  } catch (error: any) {
    console.error('Auth error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      params: context.params,
      url: request.url
    });
    return new Response(JSON.stringify({ 
      error: 'Authentication failed',
      details: error?.message || 'Unknown error',
      route: context.params.auth0
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 