import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// You'll need to set this in your .env.local file
const POWERBI_PUSH_URL = process.env.POWERBI_PUSH_URL;

export async function POST(request: NextRequest) {
  try {
    if (!POWERBI_PUSH_URL) {
      return NextResponse.json({ 
        error: 'POWERBI_PUSH_URL not configured' 
      }, { status: 500 });
    }

    // Get latest sales data
    const query = `
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
        AND t.created_at >= CURRENT_DATE
      GROUP BY DATE(t.created_at), u.name, t.payment_method
      ORDER BY sale_date DESC
      LIMIT 10
    `;

    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        message: 'No data to push',
        success: true 
      });
    }

    // Format data for Power BI
    const powerBIData = result.rows.map(row => ({
      sale_date: new Date(row.sale_date).toISOString(),
      transaction_count: parseInt(row.transaction_count),
      total_revenue: parseFloat(row.total_revenue),
      avg_transaction_value: parseFloat(row.avg_transaction_value),
      cashier_name: row.cashier_name,
      payment_method: row.payment_method
    }));

    // Push to Power BI
    const powerBIResponse = await fetch(POWERBI_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(powerBIData)
    });

    if (!powerBIResponse.ok) {
      const errorText = await powerBIResponse.text();
      console.error('Power BI Push Error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to push to Power BI',
        details: errorText
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Data pushed to Power BI successfully',
      recordsPushed: powerBIData.length,
      data: powerBIData
    });

  } catch (error) {
    console.error('Push to Power BI Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to push data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Power BI Push Endpoint',
    method: 'POST',
    description: 'Pushes current sales data to Power BI streaming dataset'
  });
} 