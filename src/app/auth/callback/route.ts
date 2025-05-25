import { NextRequest, NextResponse } from 'next/server';
import { PowerBIAuth } from '@/lib/powerbi/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      return NextResponse.redirect(new URL('/auth/error', request.url));
    }

    // Initialize Power BI auth
    const powerBIAuth = new PowerBIAuth();
    
    // Get access token
    const tokenResult = await powerBIAuth.getAccessToken();
    
    // Store token in session
    const response = NextResponse.redirect(new URL('/dashboard/reports', request.url));
    response.cookies.set('powerbi_token', tokenResult.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
    });

    return response;
  } catch (error) {
    console.error('Error in auth callback:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
} 