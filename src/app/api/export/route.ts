import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/client';
import { exportSalesData, exportInventoryData } from '@/lib/db/export-data';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { type } = await request.json();

    let filePath: string;
    switch (type) {
      case 'sales':
        filePath = await exportSalesData();
        break;
      case 'inventory':
        filePath = await exportInventoryData();
        break;
      default:
        return new NextResponse('Invalid export type', { status: 400 });
    }

    // Read the file
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    // Delete the file after reading
    fs.unlinkSync(filePath);

    // Return the file as a download
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 