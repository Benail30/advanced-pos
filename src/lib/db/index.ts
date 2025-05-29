import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create a new pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create the database instance
export const db = drizzle(pool, { schema });

// Export the pool for direct queries if needed
export { pool };

// For direct usage, especially during development
export const queryClient = new Pool({
  connectionString: process.env.DATABASE_URL,
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