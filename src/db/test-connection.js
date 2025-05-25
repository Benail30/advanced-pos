const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'pos_db',
});

async function testConnection() {
  const client = await pool.connect();
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    console.log('\nChecking tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Existing tables:', tables.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

testConnection(); 