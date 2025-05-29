import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSession } from '@auth0/nextjs-auth0';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/stores - Get all stores
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
    const storeId = searchParams.get('id');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (storeId) {
      // Get specific store
      const result = await pool.query(`
        SELECT 
          s.*,
          COUNT(DISTINCT p.id) as product_count,
          COUNT(DISTINCT u.id) as user_count
        FROM stores s
        LEFT JOIN products p ON s.id = p.store_id
        LEFT JOIN users u ON s.id = u.store_id
        WHERE s.id = $1
        GROUP BY s.id
      `, [storeId]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Store not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      });
    }

    // Get all stores with optional search
    let query = `
      SELECT 
        s.*,
        COUNT(DISTINCT p.id) as product_count,
        COUNT(DISTINCT u.id) as user_count
      FROM stores s
      LEFT JOIN products p ON s.id = p.store_id
      LEFT JOIN users u ON s.id = u.store_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (s.name ILIKE $${params.length} OR s.address ILIKE $${params.length})`;
    }

    query += ` GROUP BY s.id ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM stores s
      WHERE 1=1
    `;
    const countParams: any[] = [];

    if (search) {
      countParams.push(`%${search}%`);
      countQuery += ` AND (s.name ILIKE $${countParams.length} OR s.address ILIKE $${countParams.length})`;
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
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}

// POST /api/stores - Create new store
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

    // Only admins can create stores
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { name, address, phone } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Store name is required' },
        { status: 400 }
      );
    }

    // Check if store name already exists
    const existingStore = await pool.query(
      'SELECT id FROM stores WHERE name = $1',
      [name]
    );

    if (existingStore.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Store name already exists' },
        { status: 409 }
      );
    }

    // Create store
    const result = await pool.query(`
      INSERT INTO stores (name, address, phone)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, address, phone]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create store' },
      { status: 500 }
    );
  }
}

// PUT /api/stores - Update store
export async function PUT(request: NextRequest) {
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

    // Only admins can update stores
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id, name, address, phone } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'Store ID and name are required' },
        { status: 400 }
      );
    }

    // Check if store exists
    const existingStore = await pool.query(
      'SELECT id FROM stores WHERE id = $1',
      [id]
    );

    if (existingStore.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    // Check if name is taken by another store
    const nameCheck = await pool.query(
      'SELECT id FROM stores WHERE name = $1 AND id != $2',
      [name, id]
    );

    if (nameCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Store name already exists' },
        { status: 409 }
      );
    }

    // Update store
    const result = await pool.query(`
      UPDATE stores 
      SET name = $1, address = $2, phone = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [name, address, phone, id]);

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update store' },
      { status: 500 }
    );
  }
}

// DELETE /api/stores - Delete store
export async function DELETE(request: NextRequest) {
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

    // Only admins can delete stores
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('id');

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Check if store exists
    const existingStore = await pool.query(
      'SELECT id FROM stores WHERE id = $1',
      [storeId]
    );

    if (existingStore.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    // Check if store has associated products or users
    const associatedData = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE store_id = $1) as product_count,
        (SELECT COUNT(*) FROM users WHERE store_id = $1) as user_count
    `, [storeId]);

    const { product_count, user_count } = associatedData.rows[0];

    if (parseInt(product_count) > 0 || parseInt(user_count) > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete store with associated products or users',
          details: {
            products: parseInt(product_count),
            users: parseInt(user_count)
          }
        },
        { status: 409 }
      );
    }

    // Delete store
    await pool.query('DELETE FROM stores WHERE id = $1', [storeId]);

    return NextResponse.json({
      success: true,
      message: 'Store deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete store' },
      { status: 500 }
    );
  }
} 