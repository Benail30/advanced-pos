import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSession } from '@auth0/nextjs-auth0';
import jwt from 'jsonwebtoken';
import { getAdminStoreId, getCashierStoreId } from '@/lib/store-utils';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/products - Get products filtered by store
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

    const result = await pool.query(`
      SELECT 
        p.*,
        c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.store_id = $1
      ORDER BY p.created_at DESC
    `, [storeId]);

    // Transform the rows to match the frontend interface
    const products = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      stock: row.stock,
      category_id: row.category_id,
      category_name: row.category_name,
      store_id: row.store_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create product (Admin only)
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
        const token = await req.headers.get('Authorization')?.replace('Bearer ', '') ||
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

    // Only admins can create products
    if (!isAdmin) {
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

    const { name, description, price, stock, category_id } = await req.json();

    // Validate required fields
    if (!name || !category_id || price === undefined || stock === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, category_id, price, stock' },
        { status: 400 }
      );
    }

    // Check if category exists in the same store
    const categoryCheck = await pool.query(
      'SELECT id FROM categories WHERE id = $1 AND store_id = $2',
      [category_id, storeId]
    );

    if (categoryCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found in your store' },
        { status: 404 }
      );
    }

    // Insert the product with store_id
    const result = await pool.query(
      `INSERT INTO products (
        name, 
        description, 
        price, 
        stock, 
        category_id,
        store_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, description, price, stock, category_id, store_id, created_at, updated_at`,
      [
        name,
        description || '',
        price,
        stock,
        category_id,
        storeId
      ]
    );
    
    // Fetch the product with category name
    const productWithCategory = await pool.query(
      `SELECT 
        p.*,
        c.name as category_name
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [result.rows[0].id]
    );

    // Transform the response to match the frontend interface
    const product = {
      id: productWithCategory.rows[0].id,
      name: productWithCategory.rows[0].name,
      description: productWithCategory.rows[0].description,
      price: parseFloat(productWithCategory.rows[0].price),
      stock: productWithCategory.rows[0].stock,
      category_id: productWithCategory.rows[0].category_id,
      category_name: productWithCategory.rows[0].category_name,
      store_id: productWithCategory.rows[0].store_id,
      created_at: productWithCategory.rows[0].created_at,
      updated_at: productWithCategory.rows[0].updated_at
    };

    return NextResponse.json({
      success: true,
      data: product,
      message: `Product created successfully with ID: ${product.id}`
    });
  } catch (error: any) {
    console.error('Database error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { success: false, error: 'Product with this name already exists in your store' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 