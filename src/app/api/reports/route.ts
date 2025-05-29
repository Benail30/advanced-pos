import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/reports - Get various reports and analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'sales_summary';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let result;

    switch (reportType) {
      case 'sales_summary':
        result = await getSalesSummary(startDate, endDate);
        break;
      case 'top_products':
        result = await getTopProducts(startDate, endDate);
        break;
      case 'cashier_performance':
        result = await getCashierPerformance(startDate, endDate);
        break;
      case 'low_stock':
        result = await getLowStockProducts();
        break;
      case 'daily_sales':
        result = await getDailySales(startDate, endDate);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid report type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function getSalesSummary(startDate?: string | null, endDate?: string | null) {
  let query = `
    SELECT 
      COUNT(*) as total_transactions,
      COALESCE(SUM(total), 0) as total_revenue,
      COALESCE(AVG(total), 0) as average_transaction,
      COUNT(DISTINCT customer_id) as unique_customers
    FROM orders
    WHERE status = 'completed'
  `;

  const params: any[] = [];

  if (startDate) {
    params.push(startDate);
    query += ` AND created_at >= $${params.length}::date`;
  }

  if (endDate) {
    params.push(endDate);
    query += ` AND created_at <= $${params.length}::date + interval '1 day'`;
  }

  const result = await pool.query(query, params);
  return result.rows[0];
}

async function getTopProducts(startDate?: string | null, endDate?: string | null, limit = 10) {
  let query = `
    SELECT 
      p.id,
      p.name,
      p.price,
      COALESCE(SUM(oi.quantity), 0) as total_sold,
      COALESCE(SUM(oi.quantity * oi.price_at_sale), 0) as total_revenue,
      c.name as category_name
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id IS NOT NULL AND (o.status = 'completed' OR o.status IS NULL)
  `;

  const params: any[] = [];

  if (startDate) {
    params.push(startDate);
    query += ` AND o.created_at >= $${params.length}::date`;
  }

  if (endDate) {
    params.push(endDate);
    query += ` AND o.created_at <= $${params.length}::date + interval '1 day'`;
  }

  query += `
    GROUP BY p.id, p.name, p.price, c.name
    ORDER BY total_sold DESC
    LIMIT ${limit}
  `;

  const result = await pool.query(query, params);
  return result.rows;
}

async function getCashierPerformance(startDate?: string | null, endDate?: string | null) {
  let query = `
    SELECT 
      u.first_name || ' ' || u.last_name as cashier_name,
      COUNT(*) as total_transactions,
      COALESCE(SUM(o.total), 0) as total_sales,
      COALESCE(AVG(o.total), 0) as average_transaction
    FROM orders o
    JOIN users u ON o.cashier_id = u.id
    WHERE u.role = 'cashier' AND o.status = 'completed'
  `;

  const params: any[] = [];

  if (startDate) {
    params.push(startDate);
    query += ` AND o.created_at >= $${params.length}::date`;
  }

  if (endDate) {
    params.push(endDate);
    query += ` AND o.created_at <= $${params.length}::date + interval '1 day'`;
  }

  query += `
    GROUP BY u.id, u.first_name, u.last_name
    ORDER BY total_sales DESC
  `;

  const result = await pool.query(query, params);
  return result.rows;
}

async function getLowStockProducts() {
  const query = `
    SELECT 
      p.id,
      p.name,
      p.stock as current_stock,
      p.price,
      c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.stock <= 10
    ORDER BY p.stock ASC
    LIMIT 20
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function getDailySales(startDate?: string | null, endDate?: string | null) {
  let query = `
    SELECT 
      DATE(created_at) as sale_date,
      COUNT(*) as transaction_count,
      COALESCE(SUM(total), 0) as daily_revenue
    FROM orders
    WHERE status = 'completed'
  `;

  const params: any[] = [];

  if (startDate) {
    params.push(startDate);
    query += ` AND created_at >= $${params.length}::date`;
  } else {
    // Default to last 30 days
    query += ` AND created_at >= CURRENT_DATE - INTERVAL '30 days'`;
  }

  if (endDate) {
    params.push(endDate);
    query += ` AND created_at <= $${params.length}::date + interval '1 day'`;
  }

  query += `
    GROUP BY DATE(created_at)
    ORDER BY sale_date DESC
  `;

  const result = await pool.query(query, params);
  return result.rows;
} 