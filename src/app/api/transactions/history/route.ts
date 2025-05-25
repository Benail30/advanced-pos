import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db';
import { transactions, users } from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().uuid().optional(),
  paymentMethod: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const validatedParams = querySchema.parse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      userId: searchParams.get('userId'),
      paymentMethod: searchParams.get('paymentMethod'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    const offset = (validatedParams.page - 1) * validatedParams.limit;
    const conditions = [];

    // Add date range filter if provided
    if (validatedParams.startDate) {
      conditions.push(gte(transactions.createdAt, new Date(validatedParams.startDate)));
    }
    if (validatedParams.endDate) {
      conditions.push(lte(transactions.createdAt, new Date(validatedParams.endDate)));
    }

    // Add user filter if provided
    if (validatedParams.userId) {
      conditions.push(eq(transactions.userId, validatedParams.userId));
    }

    // Add payment method filter if provided
    if (validatedParams.paymentMethod) {
      conditions.push(eq(transactions.paymentMethod, validatedParams.paymentMethod));
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
          cashier: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(transactions)
        .leftJoin(users, eq(transactions.userId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(transactions.createdAt))
        .limit(validatedParams.limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .then((result) => Number(result[0].count)),
    ]);

    return NextResponse.json({
      transactions: transactionsList,
      pagination: {
        total: totalCount,
        page: validatedParams.page,
        limit: validatedParams.limit,
        totalPages: Math.ceil(totalCount / validatedParams.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid query parameters', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 