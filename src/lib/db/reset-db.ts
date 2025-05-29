import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from './schema';

async function resetDatabase() {
  // Connect to postgres database to drop and recreate pos_db
  const rootPool = new Pool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: 'postgres' // Connect to default postgres database
  });

  try {
    // Drop and recreate the database
    await rootPool.query('DROP DATABASE IF EXISTS pos_db WITH (FORCE)');
    await rootPool.query('CREATE DATABASE pos_db');
    await rootPool.end();

    // Connect to the new database
    const db = drizzle(new Pool({
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 5432,
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: 'pos_db'
    }), { schema });

    console.log('Database reset completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase(); 