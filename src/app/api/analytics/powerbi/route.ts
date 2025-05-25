import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/pos_db'
});

// GET handler to provide data for Power BI
export async function GET() {
  try {
    // Get sales data by date
    const salesByDate = await pool.query(`
      SELECT 
        DATE(t.created_at) as date,
        COUNT(*) as total_transactions,
        SUM(t.total_amount) as total_sales,
        AVG(t.total_amount) as average_transaction_value
      FROM transactions t
      GROUP BY DATE(t.created_at)
      ORDER BY date DESC
    `);

    // Get top selling products
    const topProducts = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.category,
        SUM(ti.quantity) as total_quantity_sold,
        SUM(ti.quantity * ti.price) as total_revenue
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
      GROUP BY p.id, p.name, p.category
      ORDER BY total_quantity_sold DESC
      LIMIT 10
    `);

    // Get sales by category
    const salesByCategory = await pool.query(`
      SELECT 
        p.category,
        COUNT(DISTINCT t.id) as transaction_count,
        SUM(ti.quantity) as total_quantity,
        SUM(ti.quantity * ti.price) as total_revenue
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
      GROUP BY p.category
      ORDER BY total_revenue DESC
    `);

    // Get customer insights
    const customerInsights = await pool.query(`
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT t.id) as total_visits,
        SUM(t.total_amount) as total_spent,
        AVG(t.total_amount) as average_spend,
        MAX(t.created_at) as last_purchase_date
      FROM customers c
      LEFT JOIN transactions t ON c.id = t.customer_id
      GROUP BY c.id, c.name
      ORDER BY total_spent DESC
    `);

    // Get inventory status
    const inventoryStatus = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.category,
        p.stock_quantity,
        p.reorder_point,
        COUNT(ti.id) as times_ordered
      FROM products p
      LEFT JOIN transaction_items ti ON p.id = ti.product_id
      GROUP BY p.id, p.name, p.category, p.stock_quantity, p.reorder_point
      ORDER BY times_ordered DESC
    `);

    // Get hourly sales distribution
    const hourlySales = await pool.query(`
      SELECT 
        EXTRACT(HOUR FROM t.created_at) as hour,
        COUNT(*) as transaction_count,
        SUM(t.total_amount) as total_sales
      FROM transactions t
      GROUP BY EXTRACT(HOUR FROM t.created_at)
      ORDER BY hour
    `);

    return NextResponse.json({
      salesByDate: salesByDate.rows,
      topProducts: topProducts.rows,
      salesByCategory: salesByCategory.rows,
      customerInsights: customerInsights.rows,
      inventoryStatus: inventoryStatus.rows,
      hourlySales: hourlySales.rows
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
} 