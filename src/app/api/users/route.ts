import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function adminStore(userId: string) {
  return prisma.store.findFirst({ where: { adminId: userId }, select: { id: true } });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const store = await adminStore(session.user.id);
  if (!store) return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });

  const cashiers = await prisma.user.findMany({
    where: { storeId: store.id, role: 'CASHIER' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: cashiers });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const store = await adminStore(session.user.id);
  if (!store) return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });

  const { name, email, password } = body;

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ success: false, error: 'Name, email, and password are required' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (existing) {
    return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const cashier = await prisma.user.create({
    data: { name: name.trim(), email: email.trim(), password: hashed, role: 'CASHIER', storeId: store.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json({ success: true, data: cashier }, { status: 201 });
}
