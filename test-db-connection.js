require('dotenv').config();
const postgres = require('postgres');

// Database connection string from environment variables
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/pos_db';

// For direct usage
const client = postgres(connectionString);

async function testConnection() {
  try {
    // Try a simple query to check connection
    const result = await client`SELECT 1 as test`;
    console.log('Database connection successful!');
    console.log('Query result:', result);
    console.log('Connection string:', connectionString);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Connection string:', connectionString);
    return false;
  } finally {
    // Close the connection
    await client.end();
  }
}

testConnection()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  }); 