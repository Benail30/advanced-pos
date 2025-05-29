import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = '';
    let params: any[] = [];

    switch (endpoint) {
      case 'sales-summary':
        query = `
          SELECT 
            DATE(t.created_at) as sale_date,
            COUNT(t.id) as transaction_count,
            SUM(t.total_amount) as total_revenue,
            AVG(t.total_amount) as avg_transaction_value,
            u.name as cashier_name,
            t.payment_method
          FROM transactions t
          JOIN users u ON t.cashier_id = u.id
          WHERE t.status = 'completed'
          ${startDate ? 'AND t.created_at >= $1' : ''}
          ${endDate ? 'AND t.created_at <= $' + (startDate ? '2' : '1') : ''}
          GROUP BY DATE(t.created_at), u.name, t.payment_method
          ORDER BY sale_date DESC
        `;
        if (startDate) params.push(startDate);
        if (endDate) params.push(endDate);
        break;

      case 'product-performance':
        query = `
          SELECT 
            p.name as product_name,
            p.sku,
            c.name as category_name,
            SUM(ti.quantity) as total_sold,
            SUM(ti.subtotal) as total_revenue,
            AVG(ti.unit_price) as avg_price,
            p.stock_quantity as current_stock,
            p.minimum_stock,
            CASE 
              WHEN p.stock_quantity <= p.minimum_stock THEN 'Low Stock'
              WHEN p.stock_quantity <= p.minimum_stock * 2 THEN 'Medium Stock'
              ELSE 'Good Stock'
            END as stock_status
          FROM products p
          LEFT JOIN transaction_items ti ON p.id = ti.product_id
          LEFT JOIN transactions t ON ti.transaction_id = t.id
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.active = true
          ${startDate ? 'AND (t.created_at >= $1 OR t.created_at IS NULL)' : ''}
          ${endDate ? 'AND (t.created_at <= $' + (startDate ? '2' : '1') + ' OR t.created_at IS NULL)' : ''}
          GROUP BY p.id, p.name, p.sku, c.name, p.stock_quantity, p.minimum_stock
          ORDER BY total_revenue DESC NULLS LAST
        `;
        if (startDate) params.push(startDate);
        if (endDate) params.push(endDate);
        break;

      case 'daily-trends':
        query = `
          SELECT 
            DATE(created_at) as date,
            EXTRACT(DOW FROM created_at) as day_of_week,
            EXTRACT(HOUR FROM created_at) as hour,
            COUNT(*) as transaction_count,
            SUM(total_amount) as revenue,
            AVG(total_amount) as avg_transaction
          FROM transactions
          WHERE status = 'completed'
          ${startDate ? 'AND created_at >= $1' : ''}
          ${endDate ? 'AND created_at <= $' + (startDate ? '2' : '1') : ''}
          GROUP BY DATE(created_at), EXTRACT(DOW FROM created_at), EXTRACT(HOUR FROM created_at)
          ORDER BY date DESC, hour
        `;
        if (startDate) params.push(startDate);
        if (endDate) params.push(endDate);
        break;

      case 'cashier-performance':
        query = `
          SELECT 
            u.name as cashier_name,
            u.email as cashier_email,
            COUNT(t.id) as total_transactions,
            SUM(t.total_amount) as total_revenue,
            AVG(t.total_amount) as avg_transaction_value,
            MIN(t.created_at) as first_sale,
            MAX(t.created_at) as last_sale,
            COUNT(DISTINCT DATE(t.created_at)) as active_days
          FROM users u
          LEFT JOIN transactions t ON u.id = t.cashier_id AND t.status = 'completed'
          WHERE u.role = 'cashier'
          ${startDate ? 'AND (t.created_at >= $1 OR t.created_at IS NULL)' : ''}
          ${endDate ? 'AND (t.created_at <= $' + (startDate ? '2' : '1') + ' OR t.created_at IS NULL)' : ''}
          GROUP BY u.id, u.name, u.email
          ORDER BY total_revenue DESC NULLS LAST
        `;
        if (startDate) params.push(startDate);
        if (endDate) params.push(endDate);
        break;

      case 'inventory-status':
        query = `
          SELECT 
            p.name as product_name,
            p.sku,
            c.name as category_name,
            p.stock_quantity,
            p.minimum_stock,
            p.price,
            p.stock_quantity * p.price as inventory_value,
            CASE 
              WHEN p.stock_quantity <= 0 THEN 'Out of Stock'
              WHEN p.stock_quantity <= p.minimum_stock THEN 'Critical'
              WHEN p.stock_quantity <= p.minimum_stock * 2 THEN 'Low'
              ELSE 'Good'
            END as stock_level,
            p.created_at as product_added_date
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.active = true
          ORDER BY 
            CASE 
              WHEN p.stock_quantity <= 0 THEN 1
              WHEN p.stock_quantity <= p.minimum_stock THEN 2
              WHEN p.stock_quantity <= p.minimum_stock * 2 THEN 3
              ELSE 4
            END,
            p.name
        `;
        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid endpoint. Available endpoints: sales-summary, product-performance, daily-trends, cashier-performance, inventory-status' 
        }, { status: 400 });
    }

    const result = await pool.query(query, params);
    
    return NextResponse.json({
      success: true,
      endpoint,
      data: result.rows,
      count: result.rows.length,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Power BI API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 