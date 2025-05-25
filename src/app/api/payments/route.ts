import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { db } from '@/lib/db';
import { payments } from '@/lib/db/schema/payment';
import { z } from 'zod';

const paymentSchema = z.object({
  transactionId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(['cash', 'card', 'e_wallet']),
  changeAmount: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    // Create payment record
    const [payment] = await db
      .insert(payments)
      .values({
        transactionId: validatedData.transactionId,
        amount: validatedData.amount,
        method: validatedData.method,
        changeAmount: validatedData.changeAmount,
        metadata: validatedData.metadata,
        status: 'completed',
      })
      .returning();

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payment processing error:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid payment data', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return new NextResponse('Transaction ID is required', { status: 400 });
    }

    const payment = await db.query.payments.findFirst({
      where: (payments, { eq }) => eq(payments.transactionId, transactionId),
    });

    if (!payment) {
      return new NextResponse('Payment not found', { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 