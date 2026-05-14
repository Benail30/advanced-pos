import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function adminStore(userId: string) {
  return prisma.store.findFirst({ where: { adminId: userId }, select: { id: true } });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await adminStore(session.user.id);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({ data: categories });
}

export async function POST(request: Request) {
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

  const existing = await prisma.category.findUnique({
    where: { name_storeId: { name, storeId: store.id } },
  });
  if (existing) {
    return NextResponse.json({ error: 'A category with that name already exists' }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: { name, description, storeId: store.id },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({ data: category }, { status: 201 });
}
