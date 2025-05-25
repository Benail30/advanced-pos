import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { createSelectSchema } from 'drizzle-zod';

// Connection string from environment
const connectionString = process.env.DATABASE_URL || 'postgres://ghassenbenali@localhost:5432/pos_db';

// Create a postgres client for queries (better performance than pg)
const queryClient = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Timeout in seconds
  connect_timeout: 10,
  prepare: true, // Use prepared statements for improved performance
});

// Create a Drizzle instance with the schema
const db = drizzle(queryClient, { schema });

// Export schema for use in other files
export * from './schema';

// Function to check database connection
export async function checkDatabaseConnection() {
  try {
    // Try a simple query to check connection
    await queryClient`SELECT 1`;
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

/**
 * Helper function to safely execute database queries with error handling
 */
export async function executeQuery<T>(
  queryFn: () => Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const result = await queryFn();
    return [result, null];
  } catch (error) {
    console.error('Database query error:', error);
    // Return typed error for better handling
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Check if an error is a PostgreSQL unique constraint violation
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Error && 
    'code' in (error as any) && 
    (error as any).code === '23505'
  );
}

// Export the db instance
export { db }; 