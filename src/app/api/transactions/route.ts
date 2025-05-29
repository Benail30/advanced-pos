import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSession } from '@auth0/nextjs-auth0';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/transactions - Get transactions based on user role
export async function GET(request: NextRequest) {
  try {
    // Check for both Auth0 and JWT authentication
    let isAuthenticated = false;
    let userId = null;
    let userRole = null;
    let isAdmin = false;

    // First check for Auth0 session (admin)
    try {
      const session = await getSession();
      if (session?.user) {
        isAuthenticated = true;
        userId = session.user.sub;
        const userRoles = (session.user['https://advanced-pos.com/roles'] as string[]) || [];
        isAdmin = userRoles.some(role => role.toLowerCase() === 'admin');
        userRole = isAdmin ? 'admin' : 'user';
      }
    } catch (error) {
      // Auth0 session check failed, continue to JWT check
    }

    // If no Auth0 session, check for JWT token (cashier)
    if (!isAuthenticated) {
      try {
        const token = request.cookies.get('auth-token')?.value;

        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (decoded.userId) {
            isAuthenticated = true;
            userId = decoded.userId;
            userRole = decoded.role;
          }
        }
      } catch (error) {
        // JWT verification failed
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const customerId = searchParams.get('customer_id');

    let query = `
      SELECT 
        o.*,
        p.method as payment_method
      FROM orders o
      LEFT JOIN (
        SELECT DISTINCT ON (order_id) order_id, method
        FROM payments 
        ORDER BY order_id, amount DESC
      ) p ON o.id = p.order_id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Role-based filtering: cashiers only see their own transactions
    if (!isAdmin && userRole === 'cashier') {
      params.push(userId);
      query += ` AND o.cashier_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }

    if (startDate) {
      params.push(startDate);
      query += ` AND o.created_at >= $${params.length}::date`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND o.created_at <= $${params.length}::date + interval '1 day'`;
    }

    query += ' ORDER BY o.created_at DESC';

    const result = await pool.query(query, params);

    // Get transaction items for each transaction
    const transactionsWithItems = await Promise.all(
      result.rows.map(async (transaction) => {
        const itemsResult = await pool.query(`
          SELECT 
            oi.*,
            oi.price_at_sale as unit_price,
            (oi.quantity * oi.price_at_sale) as subtotal,
            p.name as product_name,
            p.name as sku
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [transaction.id]);

        // Get cashier name for admin view
        let cashierName = transaction.cashier_id;
        if (transaction.cashier_id) {
          try {
            const cashierResult = await pool.query(
              'SELECT first_name, last_name, username FROM users WHERE id = $1',
              [transaction.cashier_id]
            );
            if (cashierResult.rows.length > 0) {
              const user = cashierResult.rows[0];
              cashierName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
            }
          } catch (error) {
            // Keep default cashier_id if query fails
          }
        }

        // Get customer name if customer_id exists
        let customerName = 'Walk-in Customer';
        if (transaction.customer_id) {
          try {
            const customerResult = await pool.query(
              'SELECT name FROM customers WHERE id = $1',
              [transaction.customer_id]
            );
            if (customerResult.rows.length > 0) {
              customerName = customerResult.rows[0].name;
            }
          } catch (error) {
            // Keep default if query fails
          }
        }

        return {
          ...transaction,
          total_amount: transaction.total,
          customer_name: customerName,
          items: itemsResult.rows,
          cashier_name: cashierName
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: transactionsWithItems,
      meta: {
        isAdmin,
        userRole,
        total: transactionsWithItems.length
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    // Check for both Auth0 and JWT authentication
    let isAuthenticated = false;
    let userId = null;
    let userRole = null;
    let isAdmin = false;

    // First check for Auth0 session (admin)
    try {
      const session = await getSession();
      if (session?.user) {
        isAuthenticated = true;
        userId = session.user.sub;
        const userRoles = (session.user['https://advanced-pos.com/roles'] as string[]) || [];
        isAdmin = userRoles.some(role => role.toLowerCase() === 'admin');
        userRole = isAdmin ? 'admin' : 'user';
      }
    } catch (error) {
      // Auth0 session check failed, continue to JWT check
    }

    // If no Auth0 session, check for JWT token (cashier)
    if (!isAuthenticated) {
      try {
        const token = request.cookies.get('auth-token')?.value;

        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (decoded.userId) {
            isAuthenticated = true;
            userId = decoded.userId;
            userRole = decoded.role;
          }
        }
      } catch (error) {
        // JWT verification failed
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const requestBody = await request.json();
    const {
      items,
      customer_id,
      total_amount,
      payment_method,
      payment_reference,
      notes,
      cashier_id
    } = requestBody;

    // For cashiers, automatically set their ID as cashier_id
    // For admins, they can specify any cashier (though this is typically from POS interface)
    let effectiveCashierId = userId;
    
    // If admin and cashier_id is provided, allow them to specify it
    if (isAdmin && cashier_id) {
      effectiveCashierId = cashier_id;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!total_amount || !payment_method) {
      return NextResponse.json(
        { success: false, error: 'Total amount and payment method are required' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Calculate subtotal and tax
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const tax_amount = subtotal * 0.0825;

      // Generate transaction number (try-catch in case column doesn't exist)
      let transactionNumber;
      try {
        const transactionCountResult = await client.query(
          'SELECT COUNT(*) + 1 as next_number FROM orders WHERE DATE(created_at) = CURRENT_DATE'
        );
        const nextNumber = transactionCountResult.rows[0].next_number;
        transactionNumber = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(nextNumber).padStart(4, '0')}`;
      } catch (error) {
        // Fallback if transaction_number column doesn't exist
        transactionNumber = `TXN-${Date.now()}`;
      }

      // Create transaction - handle both old and new schema
      let transactionResult;
      try {
        // Use the actual schema from docker/init.sql
        // Creating transaction with customer_id, cashier_id, total_amount, payment_method, status, and notes
        
        transactionResult = await client.query(`
          INSERT INTO orders (
            cashier_id,
            customer_id,
            total,
            status
          )
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [
          effectiveCashierId,
          customer_id || null,
          total_amount,
          'completed'
        ]);
        
        // Transaction created successfully
        transactionNumber = `TXN-${transactionResult.rows[0].id}`;
      } catch (error) {
        console.error('Transaction creation error details:', {
          message: (error as any).message,
          code: (error as any).code,
          detail: (error as any).detail,
          hint: (error as any).hint,
          position: (error as any).position,
          where: (error as any).where
        });
        throw error;
      }

      const transactionId = transactionResult.rows[0].id;

      // Add transaction items and update stock
      for (const item of items) {
        // Processing each item in the transaction
        
        // Add transaction item
        try {
          await client.query(`
            INSERT INTO order_items (
              order_id,
              product_id,
              quantity,
              price_at_sale
            )
            VALUES ($1, $2, $3, $4)
          `, [
            transactionId,
            item.product_id,
            item.quantity,
            item.unit_price
          ]);
          
          // Transaction item added successfully
        } catch (error) {
          console.error('Transaction item insertion error:', {
            message: (error as any).message,
            code: (error as any).code,
            detail: (error as any).detail
          });
          throw error;
        }

        // Update product stock
        try {
          await client.query(`
            UPDATE products 
            SET stock = stock - $1
            WHERE id = $2
          `, [item.quantity, item.product_id]);
          
          // Product stock updated successfully
        } catch (error) {
          console.error('Stock update error:', {
            message: (error as any).message,
            code: (error as any).code,
            detail: (error as any).detail
          });
          // Don't throw here, stock update failure shouldn't break the transaction
        }
      }

      // Create payment record
      try {
        await client.query(`
          INSERT INTO payments (
            order_id,
            amount,
            method,
            status
          )
          VALUES ($1, $2, $3, $4)
        `, [
          transactionId,
          total_amount,
          payment_method,
          'completed'
        ]);
        
        // Payment record created successfully
      } catch (error) {
        console.error('Payment record creation error:', {
          message: (error as any).message,
          code: (error as any).code,
          detail: (error as any).detail
        });
        // Don't throw here, payment record failure shouldn't break the transaction
      }

      await client.query('COMMIT');

      // Get the complete transaction with items
      const completeTransactionResult = await client.query(`
        SELECT 
          o.*,
          COALESCE(c.name, 'Walk-in Customer') as customer_name
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE o.id = $1
      `, [transactionId]);

      const itemsResult = await client.query(`
        SELECT 
          oi.*,
          oi.price_at_sale as unit_price,
          (oi.quantity * oi.price_at_sale) as subtotal,
          p.name as product_name,
          p.name as sku
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [transactionId]);

      const transaction = {
        ...completeTransactionResult.rows[0],
        total_amount: completeTransactionResult.rows[0].total,
        customer_name: completeTransactionResult.rows[0].customer_name,
        items: itemsResult.rows,
        cashier_name: effectiveCashierId // Show cashier_id as name for now
      };

      // Auto-generate invoice for completed transaction
      try {
        const invoiceResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/invoices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction_id: transactionId
          })
        });

        if (invoiceResponse.ok) {
          const invoiceResult = await invoiceResponse.json();
          transaction.invoice = invoiceResult.data;
        } else {
          // Invoice creation failed, but transaction succeeded
        }
      } catch (invoiceError) {
        console.error('Error creating invoice (transaction still successful):', invoiceError);
      }

      return NextResponse.json({
        success: true,
        data: transaction
      }, { status: 201 });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create transaction' },
        { status: 500 }
      );
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
} 