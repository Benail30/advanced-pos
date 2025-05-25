import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '../../../db/index';

export async function GET() {
  try {
    // Check database connection
    const isDatabaseConnected = await checkDatabaseConnection();
    
    if (!isDatabaseConnected) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Database connection failed',
          timestamp: new Date().toISOString(),
          services: {
            database: 'down'
          }
        }, 
        { status: 500 }
      );
    }
    
    // All checks passed
    return NextResponse.json(
      { 
        status: 'ok', 
        message: 'Service is healthy',
        timestamp: new Date().toISOString(),
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        services: {
          database: 'up'
        }
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
} 