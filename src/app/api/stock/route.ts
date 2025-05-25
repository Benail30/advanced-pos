import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, stockHistory } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const stockUpdateSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int(),
  type: z.enum(['sale', 'adjustment', 'restock']),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const stockCheckSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

// Update stock quantity
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, quantity, type, notes, metadata } = stockUpdateSchema.parse(body);

    // Get current product
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate new quantity
    const previousQuantity = product.stockQuantity;
    const changeQuantity = type === 'sale' ? -quantity : quantity;
    const newQuantity = previousQuantity + changeQuantity;

    // Validate stock level
    if (newQuantity < 0) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Update product stock
    await db
      .update(products)
      .set({ 
        stockQuantity: newQuantity,
        updatedAt: new Date()
      })
      .where(eq(products.id, productId));

    // Record stock history
    await db.insert(stockHistory).values({
      productId,
      previousQuantity,
      newQuantity,
      changeQuantity,
      type,
      notes,
      metadata,
      userId: 'system', // TODO: Get from auth context
    });

    return NextResponse.json({ 
      success: true,
      previousQuantity,
      newQuantity,
      changeQuantity
    });
  } catch (error) {
    console.error('Stock update error:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}

// Check stock availability
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const quantity = parseInt(searchParams.get('quantity') || '0');

    if (!productId || isNaN(quantity)) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const isAvailable = product.stockQuantity >= quantity;
    const isLowStock = product.stockQuantity <= product.minStockLevel;

    return NextResponse.json({
      isAvailable,
      isLowStock,
      currentStock: product.stockQuantity,
      minStockLevel: product.minStockLevel,
    });
  } catch (error) {
    console.error('Stock check error:', error);
    return NextResponse.json(
      { error: 'Failed to check stock' },
      { status: 500 }
    );
  }
}

// Get stock history
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const history = await db
      .select()
      .from(stockHistory)
      .where(eq(stockHistory.productId, productId))
      .orderBy(desc(stockHistory.createdAt))
      .limit(limit);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Stock history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock history' },
      { status: 500 }
    );
  }
} 