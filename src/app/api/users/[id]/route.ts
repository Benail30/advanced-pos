import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function adminStore(userId: string) {
  return prisma.store.findFirst({ where: { adminId: userId }, select: { id: true } });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const store = await adminStore(session.user.id);
  if (!store) return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });

  const cashier = await prisma.user.findFirst({
    where: { id: params.id, storeId: store.id, role: 'CASHIER' },
  });
  if (!cashier) return NextResponse.json({ success: false, error: 'Cashier not found' }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });

  const { name, email, password } = body;

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ success: false, error: 'Name and email are required' }, { status: 400 });
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email: email.trim(), NOT: { id: params.id } },
  });
  if (emailTaken) {
    return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 409 });
  }

  const updateData: any = { name: name.trim(), email: email.trim() };
  if (password) {
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    updateData.password = await bcrypt.hash(password, 12);
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const store = await adminStore(session.user.id);
  if (!store) return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });

  const cashier = await prisma.user.findFirst({
    where: { id: params.id, storeId: store.id, role: 'CASHIER' },
  });
  if (!cashier) return NextResponse.json({ success: false, error: 'Cashier not found' }, { status: 404 });

  await prisma.user.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
