import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { getSession } from '@auth0/nextjs-auth0';
import jwt from 'jsonwebtoken';
import { getAdminStoreId, getCashierStoreId } from '@/lib/store-utils';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/users - Get all users (Admin only, filtered by store)
export async function GET() {
  try {
    // Check for Auth0 session only (admin access required)
    let isAuthenticated = false;
    let userId = null;
    let userRole = null;
    let isAdmin = false;
    let storeId: string | null = null;

    try {
      const session = await getSession();
      if (session?.user) {
        isAuthenticated = true;
        userId = session.user.sub;
        const userRoles = (session.user['https://advanced-pos.com/roles'] as string[]) || [];
        isAdmin = userRoles.some(role => role.toLowerCase() === 'admin');
        userRole = isAdmin ? 'admin' : 'user';
        
        if (isAdmin) {
          storeId = await getAdminStoreId(session.user.sub);
        }
      }
    } catch (error) {
      // Auth0 session check failed
    }

    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store not found for user' },
        { status: 400 }
      );
    }

    // Get users filtered by store
    const result = await pool.query(
      `SELECT id, username, first_name, last_name, email, role, store_id, active, created_at, updated_at 
       FROM users 
       WHERE store_id = $1 AND active = true
       ORDER BY created_at DESC`,
      [storeId]
    );

    // Transform data to include computed name field
    const transformedData = result.rows.map(user => ({
      ...user,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
    }));

    return NextResponse.json({
      success: true,
      data: transformedData
    });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create user (Admin only)
export async function POST(req: Request) {
  try {
    // Check for Auth0 session only (admin access required)
    let isAuthenticated = false;
    let userId = null;
    let userRole = null;
    let isAdmin = false;
    let storeId: string | null = null;

    try {
      const session = await getSession();
      if (session?.user) {
        isAuthenticated = true;
        userId = session.user.sub;
        const userRoles = (session.user['https://advanced-pos.com/roles'] as string[]) || [];
        isAdmin = userRoles.some(role => role.toLowerCase() === 'admin');
        userRole = isAdmin ? 'admin' : 'user';
        
        if (isAdmin) {
          storeId = await getAdminStoreId(session.user.sub);
        }
      }
    } catch (error) {
      // Auth0 session check failed
    }

    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store not found for user' },
        { status: 400 }
      );
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Handle name splitting if only name is provided
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    const username = email?.split('@')[0] || 'user';

    // Validate role
    if (!['cashier', 'admin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be cashier or admin' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the admin's store
    const result = await pool.query(
      `INSERT INTO users (username, first_name, last_name, email, password, role, store_id, active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) 
       RETURNING id, username, first_name, last_name, email, role, store_id, active, created_at`,
      [username, firstName, lastName, email, hashedPassword, role, storeId]
    );

    // Transform response to include computed name field
    const user = result.rows[0];
    const transformedUser = {
      ...user,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
    };

    return NextResponse.json({
      success: true,
      data: transformedUser,
      message: 'User created successfully'
    });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 