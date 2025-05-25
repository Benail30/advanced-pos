import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok',
      message: 'API is running',
      version: '1.0.0'
    },
    { status: 200 }
  );
} 