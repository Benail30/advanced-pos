import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { getAdminStoreId, getCashierStoreId } from '@/lib/store-utils';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/categories - Get categories filtered by store
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
      SELECT * FROM categories 
      WHERE store_id = $1 AND active = true 
      ORDER BY name ASC
    `, [storeId]);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create category (Admin only)
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

    // Only admins can create categories
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

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category name already exists in this store
    const existingCategory = await pool.query(
      'SELECT id FROM categories WHERE name = $1 AND store_id = $2',
      [name, storeId]
    );

    if (existingCategory.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Category name already exists in your store' },
        { status: 409 }
      );
    }

    // Create the category in the user's store
    const result = await pool.query(
      `INSERT INTO categories (name, description, store_id, active) 
       VALUES ($1, $2, $3, true) 
       RETURNING *`,
      [name, description || '', storeId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Category created successfully'
    });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT /api/categories - Update category (Admin only)
export async function PUT(req: Request) {
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

    // Only admins can update categories
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

    const { id, name, description } = await req.json();

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'Category ID and name are required' },
        { status: 400 }
      );
    }

    // Check if category exists in user's store
    const existingCategory = await pool.query(
      'SELECT id FROM categories WHERE id = $1 AND store_id = $2',
      [id, storeId]
    );

    if (existingCategory.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found in your store' },
        { status: 404 }
      );
    }

    // Check if name is taken by another category in the same store
    const nameCheck = await pool.query(
      'SELECT id FROM categories WHERE name = $1 AND store_id = $2 AND id != $3',
      [name, storeId, id]
    );

    if (nameCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Category name already exists in your store' },
        { status: 409 }
      );
    }

    // Update category
    const result = await pool.query(
      `UPDATE categories 
       SET name = $1, description = $2, updated_at = NOW() 
       WHERE id = $3 AND store_id = $4
       RETURNING *`,
      [name, description || '', id, storeId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Category updated successfully'
    });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories - Delete category (Admin only)
export async function DELETE(req: Request) {
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

    // Only admins can delete categories
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

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category exists in user's store
    const existingCategory = await pool.query(
      'SELECT id FROM categories WHERE id = $1 AND store_id = $2',
      [id, storeId]
    );

    if (existingCategory.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Category not found in your store' },
        { status: 404 }
      );
    }

    // Check if category has associated products
    const productCheck = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = $1 AND store_id = $2',
      [id, storeId]
    );

    if (parseInt(productCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete category with associated products',
          details: {
            products: parseInt(productCheck.rows[0].count)
          }
        },
        { status: 409 }
      );
    }

    // Soft delete - set active to false
    const result = await pool.query(
      `UPDATE categories 
       SET active = false, updated_at = NOW() 
       WHERE id = $1 AND store_id = $2
       RETURNING *`,
      [id, storeId]
    );

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
} 