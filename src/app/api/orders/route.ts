import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function randomOrderId(): string {
  return String(Math.floor(1000000 + Math.random() * 9000000));
}

async function uniqueOrderId(storeId: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const id = randomOrderId();
    const exists = await prisma.order.findFirst({ where: { id, storeId } });
    if (!exists) return id;
  }
  throw new Error('Could not generate unique order ID');
}

// GET /api/orders — admin or cashier order history
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'ADMIN' && role !== 'CASHIER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const paymentMethod = searchParams.get('paymentMethod');
  const search = searchParams.get('search');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let where: any = {};

  if (role === 'ADMIN') {
    const store = await prisma.store.findFirst({
      where: { adminId: session.user.id },
      select: { id: true },
    });
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    where.storeId = store.id;
    const cashierId = searchParams.get('cashierId');
    if (cashierId) where.cashierId = cashierId;
  } else {
    // CASHIER: only their own orders
    where.cashierId = session.user.id;
  }

  if (status) where.status = status;
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to + 'T23:59:59');
  }
  if (search) {
    where.OR = [
      { id: { contains: search } },
      { customerName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      cashier: { select: { id: true, name: true, email: true } },
      items: {
        include: { product: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    data: orders.map(o => ({
      ...o,
      total: Number(o.total),
      items: o.items.map(i => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        unitCost:  Number(i.unitCost),
      })),
    })),
  });
}

// POST /api/orders — cashier creates an order
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'CASHIER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cashier = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { storeId: true, name: true },
  });
  if (!cashier?.storeId) {
    return NextResponse.json({ error: 'Cashier has no assigned store' }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const { items, customerName, paymentMethod } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Order must have at least one item' }, { status: 400 });
  }

  const validMethods = ['CASH', 'CARD', 'NFC'];
  if (!validMethods.includes(paymentMethod)) {
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
  }

  // Validate all products belong to this store and have enough stock
  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, storeId: cashier.storeId },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'One or more products not found' }, { status: 404 });
  }

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (product.stock < item.quantity) {
      return NextResponse.json({
        error: `Insufficient stock for "${product.name}" (available: ${product.stock})`,
      }, { status: 400 });
    }
  }

  const total = items.reduce((sum: number, item: any) => {
    const product = products.find(p => p.id === item.productId)!;
    return sum + Number(product.sellPrice) * item.quantity;
  }, 0);

  const orderId = await uniqueOrderId(cashier.storeId);

  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock for each product
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return tx.order.create({
      data: {
        id: orderId,
        storeId: cashier.storeId!,
        cashierId: session.user.id,
        customerName: customerName?.trim() || null,
        paymentMethod,
        total,
        status: 'COMPLETED',
        items: {
          create: items.map((item: any) => {
            const product = products.find(p => p.id === item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: Number(product.sellPrice),
              unitCost: Number(product.buyPrice),
            };
          }),
        },
      },
      include: {
        cashier: { select: { name: true } },
        store: { select: { name: true } },
        items: {
          include: { product: { select: { name: true, imageUrl: true } } },
        },
      },
    });
  });

  return NextResponse.json({
    data: {
      ...order,
      total: Number(order.total),
      items: order.items.map(i => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        unitCost:  Number(i.unitCost),
      })),
    },
  }, { status: 201 });
}
