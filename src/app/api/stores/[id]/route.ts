import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function requireAdmin(session: any) {
  return session && session.user.role === 'ADMIN';
}

async function getOwnedStore(session: any, storeId: string) {
  return prisma.store.findFirst({
    where: { id: storeId, adminId: session.user.id },
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await getOwnedStore(session, params.id);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return NextResponse.json({ error: 'Store name is required' }, { status: 400 });

  const updated = await prisma.store.update({
    where: { id: params.id },
    data: { name },
    include: { _count: { select: { products: true, cashiers: true, orders: true } } },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await getOwnedStore(session, params.id);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({ where: { order: { storeId: params.id } } });
    await tx.order.deleteMany({ where: { storeId: params.id } });
    await tx.product.deleteMany({ where: { storeId: params.id } });
    await tx.category.deleteMany({ where: { storeId: params.id } });
    await tx.user.updateMany({ where: { storeId: params.id }, data: { storeId: null } });
    await tx.store.delete({ where: { id: params.id } });
  });

  return NextResponse.json({ success: true });
}
