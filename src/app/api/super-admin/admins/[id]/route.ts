import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function requireSuperAdmin(session: any) {
  return session && (session.user as any).role === 'SUPER_ADMIN';
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!requireSuperAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (typeof body?.isActive !== 'boolean') {
    return NextResponse.json({ error: 'isActive (boolean) required' }, { status: 400 });
  }

  const admin = await prisma.user.findUnique({ where: { id: params.id } });
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { isActive: body.isActive },
    select: { id: true, isActive: true },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = params;

  const admin = await prisma.user.findUnique({ where: { id } });
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    const store = await tx.store.findFirst({ where: { adminId: id } });

    if (store) {
      await tx.orderItem.deleteMany({ where: { order: { storeId: store.id } } });
      await tx.order.deleteMany({ where: { storeId: store.id } });
      await tx.product.deleteMany({ where: { storeId: store.id } });
      await tx.category.deleteMany({ where: { storeId: store.id } });
      await tx.user.updateMany({ where: { storeId: store.id }, data: { storeId: null } });
      await tx.store.delete({ where: { id: store.id } });
    }

    await tx.user.delete({ where: { id } });
  });

  return NextResponse.json({ success: true });
}
