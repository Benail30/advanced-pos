import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create connection pool with error handling
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'pos_db',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Add pool error handler for unexpected errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Health check function
export const checkDatabaseConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  } finally {
    client.release();
  }
};

// Export drizzle instance
export const db = drizzle(pool, { schema }); 