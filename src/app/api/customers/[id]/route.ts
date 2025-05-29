import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/customers/[id] - Get specific customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(t.total_amount), 0) as total_spent_calculated
      FROM customers c
      LEFT JOIN transactions t ON c.id = t.customer_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name, email, phone, address, loyalty_points } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    // Check if customer exists
    const existingCustomer = await pool.query(
      'SELECT id FROM customers WHERE id = $1',
      [id]
    );

    if (existingCustomer.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if email or phone conflicts with other customers
    if (email || phone) {
      let checkQuery = 'SELECT id FROM customers WHERE id != $1 AND (';
      const checkParams: any[] = [id];
      const conditions: string[] = [];

      if (email) {
        checkParams.push(email);
        conditions.push(`email = $${checkParams.length}`);
      }

      if (phone) {
        checkParams.push(phone);
        conditions.push(`phone = $${checkParams.length}`);
      }

      checkQuery += conditions.join(' OR ') + ')';

      const conflictingCustomer = await pool.query(checkQuery, checkParams);
      
      if (conflictingCustomer.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Another customer with this email or phone already exists' },
          { status: 409 }
        );
      }
    }

    const result = await pool.query(`
      UPDATE customers 
      SET 
        name = $1,
        email = $2,
        phone = $3,
        address = $4,
        loyalty_points = COALESCE($5, loyalty_points),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [name, email, phone, address, loyalty_points, id]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if customer exists
    const existingCustomer = await pool.query(
      'SELECT id FROM customers WHERE id = $1',
      [id]
    );

    if (existingCustomer.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if customer has any transactions
    const transactionCheck = await pool.query(
      'SELECT COUNT(*) as count FROM transactions WHERE customer_id = $1',
      [id]
    );

    const transactionCount = parseInt(transactionCheck.rows[0].count);

    if (transactionCount > 0) {
      // Soft delete - mark as inactive instead of hard delete
      await pool.query(`
        UPDATE customers 
        SET 
          active = false,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);

      return NextResponse.json({
        success: true,
        message: 'Customer deactivated (has transaction history)'
      });
    } else {
      // Hard delete if no transactions
      await pool.query('DELETE FROM customers WHERE id = $1', [id]);

      return NextResponse.json({
        success: true,
        message: 'Customer deleted successfully'
      });
    }

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
} 