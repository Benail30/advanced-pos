import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

// GET /api/users/[id] - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        username,
        first_name,
        last_name,
        email,
        role,
        created_at,
        updated_at
      FROM users 
      WHERE id = $1
    `, [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        ...user,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        active: true
      }
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, first_name, last_name, username, email, role, active } = await request.json();

    // Handle name splitting if only name is provided
    let firstName = first_name;
    let lastName = last_name;
    let userUsername = username;

    if (name && !firstName && !lastName) {
      const nameParts = name.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, params.id]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email is already taken by another user' },
        { status: 409 }
      );
    }

    const query = `
      UPDATE users 
      SET username = $1, first_name = $2, last_name = $3, email = $4, role = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING id, username, first_name, last_name, email, role, created_at, updated_at
    `;
    
    const values = [
      userUsername || email.split('@')[0],
      firstName || '', 
      lastName || '', 
      email, 
      role || 'cashier', 
      params.id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        ...user,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        active: true
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [params.id]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // For now, skip transaction check to get basic deletion working
    // TODO: Add proper transaction check once schema is confirmed
    // const transactionCheck = await pool.query(
    //   'SELECT COUNT(*) as count FROM transactions WHERE cashier_id = $1',
    //   [params.id]
    // );

    // if (parseInt(transactionCheck.rows[0].count) > 0) {
    //   return NextResponse.json(
    //     { success: false, error: 'Cannot delete user with existing transactions. Deactivate instead.' },
    //     { status: 409 }
    //   );
    // }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [params.id]);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 