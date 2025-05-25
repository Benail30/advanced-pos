import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const customers = [
  { name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
  { name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210' },
  { name: 'Alice Johnson', email: 'alice@example.com', phone: '555-123-4567' },
  { name: 'Bob Brown', email: 'bob@example.com', phone: '555-987-6543' },
];

async function seedCustomers() {
  for (const customer of customers) {
    await pool.query(
      'INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
      [customer.name, customer.email, customer.phone]
    );
  }
  await pool.end();
  console.log('Seeded customers table with example data.');
}

seedCustomers().catch((err) => {
  console.error('Error seeding customers:', err);
  process.exit(1);
}); 