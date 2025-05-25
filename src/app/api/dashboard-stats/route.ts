import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const [salesRes, ordersRes, customersRes, productsRes] = await Promise.all([
      pool.query('SELECT COALESCE(SUM(total_amount),0) AS total_sales FROM transactions'),
      pool.query('SELECT COUNT(*) AS orders FROM transactions'),
      pool.query('SELECT COUNT(*) AS customers FROM customers'),
      pool.query('SELECT COUNT(*) AS products FROM products'),
    ]);
    await pool.end();
    return NextResponse.json({
      totalSales: Number(salesRes.rows[0].total_sales),
      orders: Number(ordersRes.rows[0].orders),
      customers: Number(customersRes.rows[0].customers),
      products: Number(productsRes.rows[0].products),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
} 