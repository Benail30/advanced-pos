import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/client';
import { PowerBIClient } from '@/lib/powerbi/client';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { reportId, workspaceId } = await request.json();

    if (!reportId || !workspaceId) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    const powerBIClient = new PowerBIClient();
    const hasAccess = await powerBIClient.checkReportAccess(reportId, workspaceId);

    if (!hasAccess) {
      return new NextResponse('Access denied', { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error checking Power BI access:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 