import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/orders/[id] — public (for receipt page) or authenticated
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      store: { select: { name: true } },
      cashier: { select: { name: true } },
      items: {
        include: { product: { select: { name: true, imageUrl: true } } },
      },
    },
  });

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  return NextResponse.json({
    data: {
      ...order,
      total: Number(order.total),
      items: order.items.map(i => ({ ...i, unitPrice: Number(i.unitPrice) })),
    },
  });
}

// POST /api/orders/[id]/refund — admin refunds an order
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await prisma.store.findFirst({
    where: { adminId: session.user.id },
    select: { id: true },
  });
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const order = await prisma.order.findFirst({
    where: { id: params.id, storeId: store.id },
    include: { items: true },
  });

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.status === 'REFUNDED') {
    return NextResponse.json({ error: 'Order is already refunded' }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    // Restore stock for each item
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    await tx.order.update({
      where: { id: params.id },
      data: { status: 'REFUNDED' },
    });
  });

  return NextResponse.json({ success: true });
}
