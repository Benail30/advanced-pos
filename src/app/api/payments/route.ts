import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSession } from '@auth0/nextjs-auth0';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/payments - Get all payments
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
    const orderId = searchParams.get('order_id');
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        p.*,
        o.total as order_total,
        u.first_name || ' ' || u.last_name as cashier_name
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN users u ON o.cashier_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (orderId) {
      params.push(orderId);
      query += ` AND p.order_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }

    if (method) {
      params.push(method);
      query += ` AND p.method = $${params.length}`;
    }

    query += ` ORDER BY p.payment_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM payments p
      WHERE 1=1
    `;
    const countParams: any[] = [];

    if (orderId) {
      countParams.push(orderId);
      countQuery += ` AND p.order_id = $${countParams.length}`;
    }

    if (status) {
      countParams.push(status);
      countQuery += ` AND p.status = $${countParams.length}`;
    }

    if (method) {
      countParams.push(method);
      countQuery += ` AND p.method = $${countParams.length}`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create new payment
export async function POST(request: NextRequest) {
  try {
    // Check for both Auth0 and JWT authentication
    let isAuthenticated = false;
    let userId = null;
    let userRole = null;

    // First check for Auth0 session (admin)
    try {
      const session = await getSession();
      if (session?.user) {
        isAuthenticated = true;
        userId = session.user.sub;
        userRole = 'admin';
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

    const { order_id, amount, method, status = 'pending' } = await request.json();

    if (!order_id || !amount || !method) {
      return NextResponse.json(
        { success: false, error: 'Order ID, amount, and method are required' },
        { status: 400 }
      );
    }

    // Check if order exists
    const orderResult = await pool.query(
      'SELECT id, total FROM orders WHERE id = $1',
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Create payment
    const result = await pool.query(`
      INSERT INTO payments (order_id, amount, method, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [order_id, amount, method, status]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
} 