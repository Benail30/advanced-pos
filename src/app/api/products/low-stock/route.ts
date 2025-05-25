import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/pos_db'
});

// GET handler to retrieve products with low stock
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.stock_quantity,
        p.reorder_point,
        p.category,
        p.price,
        p.image_url,
        p.created_at,
        p.updated_at
      FROM products p
      WHERE p.stock_quantity <= p.reorder_point
      ORDER BY p.stock_quantity ASC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return NextResponse.json({ error: 'Failed to fetch low stock products' }, { status: 500 });
  }
} 