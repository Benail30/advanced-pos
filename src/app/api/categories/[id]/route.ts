import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function adminStore(userId: string) {
  return prisma.store.findFirst({ where: { adminId: userId }, select: { id: true } });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await adminStore(session.user.id);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const description = body?.description?.trim() || null;

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const existing = await prisma.category.findFirst({
    where: { id: params.id, storeId: store.id },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  const duplicate = await prisma.category.findFirst({
    where: { name, storeId: store.id, NOT: { id: params.id } },
  });
  if (duplicate) {
    return NextResponse.json({ error: 'A category with that name already exists' }, { status: 409 });
  }

  const category = await prisma.category.update({
    where: { id: params.id },
    data: { name, description },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({ data: category });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await adminStore(session.user.id);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const category = await prisma.category.findFirst({
    where: { id: params.id, storeId: store.id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  if (category._count.products > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${category._count.products} product(s) still use this category` },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id: params.id } });

  return NextResponse.json({ data: { id: params.id } });
}
