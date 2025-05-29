import { NextRequest, NextResponse } from 'next/server';
import { Customer } from '@/types';
import { sql } from '@vercel/postgres';
import { getSession } from '@auth0/nextjs-auth0';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { getAdminStoreId, getCashierStoreId } from '@/lib/store-utils';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Sample customer data - would come from a database in a real implementation
const customers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, USA',
    totalOrders: 12,
    totalSpent: 782.45,
    lastOrder: '2023-09-10T11:45:00Z',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 234-5678',
    address: '456 Oak Ave, Somewhere, USA',
    totalOrders: 5,
    totalSpent: 320.18,
    lastOrder: '2023-09-05T09:15:00Z',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'mbrown@example.com',
    phone: '(555) 345-6789',
    address: '789 Pine St, Elsewhere, USA',
    totalOrders: 8,
    totalSpent: 455.90,
    lastOrder: '2023-09-08T16:20:00Z',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '(555) 456-7890',
    totalOrders: 3,
    totalSpent: 142.75,
    lastOrder: '2023-08-28T14:10:00Z',
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'rwilson@example.com',
    phone: '(555) 567-8901',
    address: '321 Cedar Rd, Nowhere, USA',
    totalOrders: 15,
    totalSpent: 1250.32,
    lastOrder: '2023-09-12T14:30:00Z',
  },
];

// Helper function to check if user is admin
const isAdmin = (roles: string[]) => roles.includes('admin');

// GET /api/customers - Get all customers (Admin and Cashier, filtered by store)
export async function GET(req: Request) {
  try {
    // Check for both Auth0 and JWT authentication
    let isAuthenticated = false;
    let userId = null;
    let userRole = null;
    let isAdmin = false;
    let storeId: string | null = null;

    // First check for Auth0 session (admin)
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
      // Auth0 session check failed, continue to JWT check
    }

    // If no Auth0 session, check for JWT token (cashier)
    if (!isAuthenticated) {
      try {
        const token = req.headers.get('Authorization')?.replace('Bearer ', '') ||
                      req.headers.get('Cookie')?.split('auth-token=')[1]?.split(';')[0];

        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (decoded.userId) {
            isAuthenticated = true;
            userId = decoded.userId;
            userRole = decoded.role;
            isAdmin = decoded.role === 'admin';
            
            if (decoded.role === 'cashier') {
              storeId = await getCashierStoreId(decoded.userId);
            }
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

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store not found for user' },
        { status: 400 }
      );
    }

    // Get customers filtered by store
    const result = await pool.query(
      `SELECT id, name, email, phone, address, identity_card_number, store_id, created_at, updated_at 
       FROM customers 
       WHERE store_id = $1
       ORDER BY name ASC`,
      [storeId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create customer (Admin and Cashier)
export async function POST(req: Request) {
  try {
    // Check for both Auth0 and JWT authentication
    let isAuthenticated = false;
    let userId = null;
    let userRole = null;
    let isAdmin = false;
    let storeId: string | null = null;

    // First check for Auth0 session (admin)
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
      // Auth0 session check failed, continue to JWT check
    }

    // If no Auth0 session, check for JWT token (cashier)
    if (!isAuthenticated) {
      try {
        const token = req.headers.get('Authorization')?.replace('Bearer ', '') ||
                      req.headers.get('Cookie')?.split('auth-token=')[1]?.split(';')[0];

        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (decoded.userId) {
            isAuthenticated = true;
            userId = decoded.userId;
            userRole = decoded.role;
            isAdmin = decoded.role === 'admin';
            
            if (decoded.role === 'cashier') {
              storeId = await getCashierStoreId(decoded.userId);
            }
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

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store not found for user' },
        { status: 400 }
      );
    }

    const { name, email, phone, address, identity_card_number } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    // Check if customer with same email, phone, or identity card already exists in the store
    const checkConditions: string[] = [];
    const checkParams: any[] = [];

    if (email) {
      checkParams.push(email);
      checkConditions.push(`email = $${checkParams.length}`);
    }

    if (phone) {
      checkParams.push(phone);
      checkConditions.push(`phone = $${checkParams.length}`);
    }

    if (identity_card_number) {
      checkParams.push(identity_card_number);
      checkConditions.push(`identity_card_number = $${checkParams.length}`);
    }

    if (checkConditions.length > 0) {
      const checkQuery = `SELECT id FROM customers WHERE ${checkConditions.join(' OR ')} AND store_id = $${checkParams.length + 1}`;
      const existingCustomer = await pool.query(checkQuery, [...checkParams, storeId]);
      
      if (existingCustomer.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Customer with this email, phone, or identity card number already exists in your store' },
          { status: 409 }
        );
      }
    }

    // Create customer in the user's store
    const customerId = randomUUID();
    const result = await pool.query(`
      INSERT INTO customers (
        id,
        name,
        email,
        phone,
        address,
        identity_card_number,
        store_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      customerId,
      name,
      email || null,
      phone || null,
      address || null,
      identity_card_number || null,
      storeId
    ]);

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Customer created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRoles = session.user['https://advanced-pos.com/roles'] || [];
    if (!isAdmin(userRoles)) {
      return NextResponse.json(
        { error: 'Only admins can delete customers' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }
    
    await pool.query(`
      UPDATE customers 
      SET active = false, updated_at = NOW()
      WHERE id = $1::uuid
    `, [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete customer' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    const userRoles = session.user['https://advanced-pos.com/roles'] || [];
    const { id, name, email, phone, address } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get database user ID
    const userResult = await pool.query(`
      SELECT id FROM users WHERE auth0_id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const dbUserId = userResult.rows[0].id;

    // Check if user has permission to edit this customer
    const customerCheck = await pool.query(`
      SELECT created_by
      FROM customers 
      WHERE id = $1::uuid
    `, [id]);

    if (customerCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerCheck.rows[0];
    if (!isAdmin(userRoles) && customer.created_by !== dbUserId) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this customer' },
        { status: 403 }
      );
    }

    const result = await pool.query(`
      UPDATE customers 
      SET 
        name = $1,
        email = $2,
        phone = $3,
        address = $4,
        updated_at = NOW()
      WHERE id = $5::uuid
      RETURNING *
    `, [name, email, phone, address, id]);

    return NextResponse.json({ customer: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    // Check for unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update customer' },
      { status: 500 }
    );
  }
} 