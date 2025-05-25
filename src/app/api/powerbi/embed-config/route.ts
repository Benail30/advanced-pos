import { NextRequest, NextResponse } from 'next/server';
import { PowerBIAuth } from '@/lib/powerbi/auth';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const filterPane = searchParams.get('filterPane') === 'true';
    const navPane = searchParams.get('navPane') === 'true';

    // Initialize Power BI auth
    const powerbiAuth = new PowerBIAuth();
    
    // Get the embed token
    const accessToken = await powerbiAuth.getEmbedToken(
      process.env.NEXT_PUBLIC_POWERBI_REPORT_ID || '',
      process.env.NEXT_PUBLIC_POWERBI_WORKSPACE_ID || ''
    );

    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'Failed to generate Power BI embed token.' 
        }, 
        { status: 500 }
      );
    }

    // Return the embed configuration
    return NextResponse.json({
      accessToken,
      settings: {
        filterPaneEnabled: filterPane,
        navContentPaneEnabled: navPane,
        localeSettings: {
          language: 'en',
          formatLocale: 'en-US',
        },
      },
    });
  } catch (error) {
    console.error('Error generating Power BI embed configuration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to generate Power BI embed configuration',
        message: errorMessage 
      }, 
      { status: 500 }
    );
  }
} 