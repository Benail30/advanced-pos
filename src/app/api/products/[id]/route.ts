import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSession } from '@auth0/nextjs-auth0';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/products/[id] - Get a single product
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      `SELECT 
        p.*,
        c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      price: parseFloat(result.rows[0].price),
      cost: parseFloat(result.rows[0].price),
      stock_quantity: result.rows[0].stock,
      minimum_stock: 0,
      category_id: result.rows[0].category_id,
      category_name: result.rows[0].category_name,
      sku: result.rows[0].name,
      active: true,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at
    };

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      price, 
      stock_quantity,
      category_id,
      sku
    } = body;

    // Update the product
    const result = await pool.query(
      `UPDATE products 
       SET name = $1, 
           description = $2, 
           price = $3, 
           stock = $4,
           category_id = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, description, price, stock_quantity, category_id, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch the updated product with category name
    const productWithCategory = await pool.query(
      `SELECT 
        p.*,
        c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [params.id]
    );

    const product = {
      id: productWithCategory.rows[0].id,
      name: productWithCategory.rows[0].name,
      description: productWithCategory.rows[0].description,
      price: parseFloat(productWithCategory.rows[0].price),
      cost: parseFloat(productWithCategory.rows[0].price),
      stock_quantity: productWithCategory.rows[0].stock,
      minimum_stock: 0,
      category_id: productWithCategory.rows[0].category_id,
      category_name: productWithCategory.rows[0].category_name,
      sku: productWithCategory.rows[0].name,
      active: true,
      created_at: productWithCategory.rows[0].created_at,
      updated_at: productWithCategory.rows[0].updated_at
    };

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Database error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { success: false, error: 'Product with this SKU already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
        const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                      request.headers.get('Cookie')?.split('auth-token=')[1]?.split(';')[0];

        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (decoded.userId) {
            isAuthenticated = true;
            userId = decoded.userId;
            userRole = decoded.role;
            isAdmin = decoded.role === 'admin';
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

    // Only admins can delete products
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required to delete products' },
        { status: 403 }
      );
    }

    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
} 