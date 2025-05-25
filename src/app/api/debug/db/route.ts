import { NextResponse } from 'next/server';
import { checkDatabaseConnection, db } from '@/lib/db';
import { sql as drizzleSql } from 'drizzle-orm';

export async function GET() {
  try {
    // Use the existing function to check connection
    const connectionStatus = await checkDatabaseConnection();
    
    // Add connection details from env
    const connectionDetails = {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
    };
    
    // Test query to check if we can query the products table
    let productsTest = null;
    try {
      const result = await db.execute(drizzleSql`SELECT COUNT(*) FROM products`);
      productsTest = {
        success: true,
        count: (result as any).rows?.[0]?.count || 0
      };
    } catch (error) {
      productsTest = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
    
    return NextResponse.json({
      connected: connectionStatus.success,
      details: connectionDetails,
      message: connectionStatus.message,
      error: connectionStatus.error,
      productsTest
    });
  } catch (error) {
    console.error('Error checking database connection:', error);
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 