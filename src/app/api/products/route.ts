import { NextRequest, NextResponse } from 'next/server';
import { db, executeQuery, isUniqueConstraintError } from '@/lib/db';
import { products, categories } from '@/lib/db/schema';
import { eq, desc, sql, and, like, or, asc, gte, lte, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@auth0/nextjs-auth0';

// Type for database product row
interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  price: string;
  cost_price: string | null;
  category_id: string | null;
  category_name?: string | null;
  store_id: string | null;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number | null;
  active: boolean;
  image_url: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  [key: string]: any; // For other fields that might be present
}

// Product validation schema
const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional().default(''),
  sku: z.string().optional(),
  barcode: z.string().optional().nullable(),
  price: z.number().positive("Price must be positive"),
  cost_price: z.number().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  category: z.string().optional(), // For creating new category on the fly
  store_id: z.string().uuid().optional().nullable(),
  stock: z.number().int().default(0),
  minStock: z.number().int().default(0),
  maxStock: z.number().int().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
  image_url: z.string().optional().nullable()
});

// GET handler to retrieve all products or filter by category
export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getSession(request, new NextResponse());
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category');
    const name = searchParams.get('name');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const limit = parseInt(searchParams.get('limit') || '100');
    
    console.log('GET /api/products - Fetching products');

    // Get the products using SQL directly to avoid relation issues
    const [queryResult, error] = await executeQuery(async () => {
      // Build the SQL query directly
      let sqlQuery = sql`
        SELECT 
          p.*,
          c.name as category_name
        FROM 
          products p
        LEFT JOIN 
          categories c ON p.category_id = c.id
      `;
      
      // Build additional WHERE conditions
      const conditions = [];
      
      if (categoryId) {
        conditions.push(sql`p.category_id = ${categoryId}`);
      }
      
      if (name) {
        conditions.push(sql`p.name ILIKE ${`%${name}%`}`);
      }
      
      if (minPrice && !isNaN(Number(minPrice))) {
        conditions.push(sql`p.price::numeric >= ${Number(minPrice)}`);
      }
      
      if (maxPrice && !isNaN(Number(maxPrice))) {
        conditions.push(sql`p.price::numeric <= ${Number(maxPrice)}`);
      }
      
      if (inStock === 'true') {
        conditions.push(sql`p.stock_quantity >= 1`);
      }
      
      // Add additional WHERE conditions if any
      if (conditions.length > 0) {
        const conditionsSQL = conditions.reduce((acc, condition, index) => {
          if (index === 0) return condition;
          return sql`${acc} AND ${condition}`;
        }, sql``);
        
        sqlQuery = sql`${sqlQuery} WHERE ${conditionsSQL}`;
      }
      
      // Add ORDER BY clause
      if (sortBy === 'price') {
        sqlQuery = sql`${sqlQuery} ORDER BY p.price::numeric ${sortOrder === 'desc' ? sql`DESC` : sql`ASC`}`;
      } else if (sortBy === 'stock') {
        sqlQuery = sql`${sqlQuery} ORDER BY p.stock_quantity ${sortOrder === 'desc' ? sql`DESC` : sql`ASC`}`;
      } else {
        sqlQuery = sql`${sqlQuery} ORDER BY p.name ${sortOrder === 'desc' ? sql`DESC` : sql`ASC`}`;
      }
      
      // Add LIMIT
      sqlQuery = sql`${sqlQuery} LIMIT ${limit}`;
      
      return db.execute(sqlQuery);
    });
    
    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
    
    console.log('Query result:', queryResult);
    
    // Format the result to match the expected structure
    const rows = queryResult ? (queryResult as any).rows || [] : [];
    console.log('Found rows:', rows.length, rows.slice(0, 2));
    
    // Add more thorough debug logging
    if (rows.length === 0 && queryResult) {
      console.log('Raw query result structure:', JSON.stringify(Object.keys(queryResult)));
      // Check if data is in a different property
      if ((queryResult as any).length > 0) {
        console.log('Data appears to be directly in result array');
        return NextResponse.json(queryResult);
      }
    }
    
    const formattedResult = rows.length > 0 ? rows.map((product: ProductRow) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      price: parseFloat(String(product.price)),
      cost_price: product.cost_price ? parseFloat(String(product.cost_price)) : null,
      category_id: product.category_id,
      category_name: product.category_name || null,
      store_id: product.store_id,
      stock: product.stock_quantity || 0,
      minStock: product.min_stock_level || 0,
      maxStock: product.max_stock_level || null,
      status: product.active ? 'active' : 'inactive',
      image_url: product.image_url || null,
      created_at: product.created_at,
      updated_at: product.updated_at
    })) : queryResult; // If rows is empty but queryResult exists, return the raw result
    
    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST handler to create a new product
export async function POST(request: Request) {
  try {
    // Get session
    const session = await getSession(request, new NextResponse());
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Product creation request body:', body);
    
    // Validate the request body
    const validatedData = productSchema.parse(body);
    
    // Create the product
    const [newProduct] = await db.insert(products).values({
      ...validatedData,
      price: validatedData.price.toString(),
      cost_price: validatedData.cost_price?.toString() || null,
      stock_quantity: validatedData.stock,
      min_stock_level: validatedData.minStock,
      max_stock_level: validatedData.maxStock,
      active: validatedData.status === 'active'
    }).returning();
    
    return NextResponse.json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT handler to update a product
export async function PUT(request: Request) {
  try {
    // Get session
    const session = await getSession(request, new NextResponse());
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = productSchema.parse(body);
    
    // Check if product exists
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, validatedData.id!)
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update the product
    const [updatedProduct] = await db.update(products)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        sku: validatedData.sku,
        barcode: validatedData.barcode,
        price: validatedData.price.toString(),
        cost_price: validatedData.cost_price?.toString() || null,
        category_id: validatedData.category_id,
        stock_quantity: validatedData.stock,
        min_stock_level: validatedData.minStock,
        max_stock_level: validatedData.maxStock,
        active: validatedData.status === 'active',
        image_url: validatedData.image_url
      })
      .where(eq(products.id, validatedData.id!))
      .returning();
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a product
export async function DELETE(request: Request) {
  try {
    // Get session
    const session = await getSession(request, new NextResponse());
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, id)
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete the product
    await db.delete(products)
      .where(eq(products.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
} 