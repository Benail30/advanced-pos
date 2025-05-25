import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const result = await pool.query(`
      SELECT t.id, c.name as customer, t.total_amount, t.created_at, t.status
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `);
    await pool.end();
    return NextResponse.json(result.rows.map((row: any) => ({
      id: row.id,
      customer: row.customer || 'Unknown',
      amount: Number(row.total_amount),
      created_at: row.created_at,
      status: row.status || 'completed',
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recent transactions' }, { status: 500 });
  }
} 