import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

// Get connection string from environment variable
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/pos_db';

// Create a connection instance
const sql = postgres(connectionString, { max: 1 });

// Create Drizzle instance
const db = drizzle(sql);

// Run migrations
async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the migration function
runMigrations(); 