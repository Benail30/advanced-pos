import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Database connection string from environment variables
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/pos_db';

const pool = new Pool({
  connectionString: connectionString,
});

export const db = drizzle(pool, { schema });

// For direct usage, especially during development
export const queryClient = new Pool({
  connectionString: connectionString,
  prepare: false
});
export const devDb = drizzle(queryClient, { schema });

// Function to check database connection
export async function checkDatabaseConnection() {
  try {
    // Try a simple query to check connection
    await queryClient.query('SELECT 1');
    return { success: true, message: 'Database connection is successful' };
  } catch (error) {
    console.error('Database connection error:', error);
    return { 
      success: false, 
      message: 'Failed to connect to database',
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 