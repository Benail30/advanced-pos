import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function requireAdmin(session: any) {
  return session && session.user.role === 'ADMIN';
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stores = await prisma.store.findMany({
    where: { adminId: session!.user.id },
    include: {
      _count: { select: { products: true, cashiers: true, orders: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ data: stores });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) return NextResponse.json({ error: 'Store name is required' }, { status: 400 });

  const store = await prisma.store.create({
    data: { name, adminId: session!.user.id },
    include: { _count: { select: { products: true, cashiers: true, orders: true } } },
  });

  return NextResponse.json({ data: store }, { status: 201 });
}
