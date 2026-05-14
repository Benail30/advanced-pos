import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, email, password, storeName } = body;

  if (!name?.trim() || !email?.trim() || !password || !storeName?.trim()) {
    return NextResponse.json(
      { error: 'Name, email, password, and store name are all required' },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (existing) {
    return NextResponse.json(
      { error: 'An account with that email already exists' },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  try {
    const { user, store } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.trim(),
          password: hashed,
          role: 'ADMIN',
        },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      const store = await tx.store.create({
        data: { name: storeName.trim(), adminId: user.id },
        select: { id: true, name: true, createdAt: true },
      });
      return { user, store };
    });

    return NextResponse.json({ user, store }, { status: 201 });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
