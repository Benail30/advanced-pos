import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import QRCode from 'qrcode';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

// GET /api/invoices - Get all invoices or specific invoice
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('id');
    const transactionId = searchParams.get('transaction_id');

    if (invoiceId) {
      // Get specific invoice
      const result = await pool.query(`
        SELECT 
          i.*,
          t.created_at as transaction_date,
          COALESCE(p.method, 'cash') as payment_method,
          t.status as transaction_status,
          COALESCE(c.name, 'Walk-in Customer') as customer_name,
          c.email as customer_email,
          c.phone as customer_phone,
          c.address as customer_address
        FROM invoices i
        LEFT JOIN orders t ON i.order_id = t.id
        LEFT JOIN (
          SELECT DISTINCT ON (order_id) order_id, method
          FROM payments 
          ORDER BY order_id, amount DESC
        ) p ON p.order_id = t.id
        LEFT JOIN customers c ON i.customer_id = c.id
        WHERE i.id = $1
      `, [invoiceId]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invoice not found' },
          { status: 404 }
        );
      }

      // Get invoice items
      const itemsResult = await pool.query(`
        SELECT 
          ti.*,
          p.name as product_name,
          p.sku
        FROM order_items ti
        JOIN products p ON ti.product_id = p.id
        WHERE ti.order_id = $1
      `, [result.rows[0].order_id]);

      const invoice = {
        ...result.rows[0],
        items: itemsResult.rows
      };

      return NextResponse.json({
        success: true,
        data: invoice
      });
    }

    // Get all invoices with pagination
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        i.*,
        COALESCE(c.name, 'Walk-in Customer') as customer_name,
        COALESCE(p.method, 'cash') as payment_method
      FROM invoices i
      LEFT JOIN orders t ON i.order_id = t.id
      LEFT JOIN (
        SELECT DISTINCT ON (order_id) order_id, method
        FROM payments 
        ORDER BY order_id, amount DESC
      ) p ON p.order_id = t.id
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create invoice for transaction
export async function POST(request: NextRequest) {
  try {
    const { transaction_id } = await request.json();

    if (!transaction_id) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get transaction details
      const transactionResult = await client.query(`
        SELECT 
          t.*,
          COALESCE(c.name, 'Walk-in Customer') as customer_name,
          c.email as customer_email
        FROM orders t
        LEFT JOIN customers c ON t.customer_id = c.id
        WHERE t.id = $1
      `, [transaction_id]);

      if (transactionResult.rows.length === 0) {
        throw new Error('Transaction not found');
      }

      const transaction = transactionResult.rows[0];

      // Check if invoice already exists
      const existingInvoice = await client.query(
        'SELECT id FROM invoices WHERE order_id = $1',
        [transaction_id]
      );

      if (existingInvoice.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Invoice already exists for this transaction' },
          { status: 409 }
        );
      }

      // Get transaction items for calculations
      const itemsResult = await client.query(`
        SELECT * FROM order_items WHERE order_id = $1
      `, [transaction_id]);

      const items = itemsResult.rows;
      const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.price_at_sale)), 0);
      const taxRate = 0.0825; // 8.25%
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;

      // Generate invoice number
      const invoiceCountResult = await client.query(
        'SELECT COUNT(*) + 1 as next_number FROM invoices WHERE DATE(created_at) = CURRENT_DATE'
      );
      const nextNumber = invoiceCountResult.rows[0].next_number;
      const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(nextNumber).padStart(4, '0')}`;

      // Generate QR code data (can be used for payment verification or invoice lookup)
      const qrData = {
        invoice_number: invoiceNumber,
        order_id: transaction_id,
        total_amount: totalAmount,
        date: new Date().toISOString(),
        customer: transaction.customer_name
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));

      // Create invoice with SERIAL ID (auto-increment)
      const invoiceResult = await client.query(`
        INSERT INTO invoices (
          invoice_number,
          order_id,
          customer_id,
          subtotal,
          tax_amount,
          discount_amount,
          total_amount,
          invoice_date,
          due_date,
          status,
          notes,
          qr_code_data
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW() + INTERVAL '30 days', 'paid', $8, $9)
        RETURNING *
      `, [
        invoiceNumber,
        transaction_id,
        transaction.customer_id,
        subtotal,
        taxAmount,
        0, // discount_amount
        totalAmount,
        `Invoice for transaction ${transaction_id}`,
        qrCodeDataURL
      ]);

      await client.query('COMMIT');

      const invoice = invoiceResult.rows[0];

      return NextResponse.json({
        success: true,
        data: {
          ...invoice,
          customer_name: transaction.customer_name,
          items: items
        }
      }, { status: 201 });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: `Failed to create invoice: ${(error as any).message}` },
      { status: 500 }
    );
  }
} 