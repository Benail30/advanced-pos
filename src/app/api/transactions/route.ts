import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/client';
import { db } from '@/lib/db';
import { transactions, transactionItems, products, productStoreInventory, users } from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, total, paymentMethod = 'cash' } = await request.json();
    const userId = session.user.id;
    const storeId = session.user.storeId;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items data' }, { status: 400 });
    }

    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
    }

    // Validate stock availability before starting transaction
    for (const item of items) {
      if (!item.id || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
      }

      const [inventory] = await db
        .select()
        .from(productStoreInventory)
        .where(
          and(
            eq(productStoreInventory.product_id, item.id),
            eq(productStoreInventory.store_id, storeId)
          )
        );

      if (!inventory) {
        return NextResponse.json(
          { error: `Product ${item.id} not found in store inventory` },
          { status: 404 }
        );
      }

      if (inventory.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${item.id}` },
          { status: 400 }
        );
      }
    }

    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Create transaction record
      const [transaction] = await tx
        .insert(transactions)
        .values({
          transactionNumber: `TRX-${Date.now()}`,
          storeId: storeId,
          userId: userId,
          subtotal: total.toString(),
          taxAmount: (total * 0.1).toString(), // 10% tax
          discountAmount: '0.00',
          totalAmount: (total * 1.1).toString(), // Including 10% tax
          paymentMethod: paymentMethod,
          status: 'completed',
        })
        .returning();

      // Create transaction items and update inventory
      for (const item of items) {
        // Add transaction item
        await tx.insert(transactionItems).values({
          transaction_id: transaction.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price.toString(),
          subtotal: (item.price * item.quantity).toString(),
          total: (item.price * item.quantity).toString(),
        });

        // Update store inventory
        const [inventory] = await tx
          .select()
          .from(productStoreInventory)
          .where(
            and(
              eq(productStoreInventory.product_id, item.id),
              eq(productStoreInventory.store_id, storeId)
            )
          );

        if (!inventory) {
          throw new Error(`Product ${item.id} not found in store inventory`);
        }

        const newQuantity = inventory.quantity - item.quantity;
        if (newQuantity < 0) {
          throw new Error(`Insufficient stock for product ${item.id}`);
        }

        await tx
          .update(productStoreInventory)
          .set({
            quantity: newQuantity,
            updated_at: new Date(),
          })
          .where(
            and(
              eq(productStoreInventory.product_id, item.id),
              eq(productStoreInventory.store_id, storeId)
            )
          );
      }

      return transaction;
    });

    return NextResponse.json({
      success: true,
      transaction: result,
      message: 'Transaction completed successfully'
    });
  } catch (error) {
    console.error('Transaction error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET handler to fetch transactions
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const paymentMethod = searchParams.get('paymentMethod');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;
    const conditions = [eq(transactions.storeId, session.user.storeId)];

    // Add date range filter if provided
    if (startDate) {
      conditions.push(gte(transactions.createdAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(transactions.createdAt, new Date(endDate)));
    }

    // Add user filter if provided
    if (userId) {
      conditions.push(eq(transactions.userId, userId));
    }

    // Add payment method filter if provided
    if (paymentMethod) {
      conditions.push(eq(transactions.paymentMethod, paymentMethod));
    }

    // Fetch transactions with user information
    const [transactionsList, totalCount] = await Promise.all([
      db
        .select({
          id: transactions.id,
          transactionNumber: transactions.transactionNumber,
          totalAmount: transactions.totalAmount,
          paymentMethod: transactions.paymentMethod,
          status: transactions.status,
          createdAt: transactions.createdAt,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
          },
        })
        .from(transactions)
        .leftJoin(users, eq(transactions.userId, users.id))
        .where(and(...conditions))
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(and(...conditions))
        .then((result) => Number(result[0].count)),
    ]);

    return NextResponse.json({
      transactions: transactionsList,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
} 