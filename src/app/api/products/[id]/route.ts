import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function adminStore(userId: string) {
  return prisma.store.findFirst({ where: { adminId: userId }, select: { id: true } });
}

function serializeProduct(p: {
  id: string; name: string; description: string | null; imageUrl: string | null;
  buyPrice: object; sellPrice: object; stock: number; sku: string | null;
  categoryId: string | null; category: { id: string; name: string } | null;
  createdAt: Date; updatedAt: Date;
}) {
  return { ...p, buyPrice: Number(p.buyPrice), sellPrice: Number(p.sellPrice) };
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

  const existing = await prisma.product.findFirst({
    where: { id: params.id, storeId: store.id },
  });
  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const body = await request.json().catch(() => null);
  const { name, imageUrl, sku, description, buyPrice, sellPrice, stock, categoryId } = body ?? {};

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  if (!categoryId) return NextResponse.json({ error: 'Category is required' }, { status: 400 });

  const buy = Number(buyPrice);
  const sell = Number(sellPrice);
  const qty = Number(stock);

  if (isNaN(buy) || buy < 0) return NextResponse.json({ error: 'Buy price must be a non-negative number' }, { status: 400 });
  if (isNaN(sell) || sell < 0) return NextResponse.json({ error: 'Sell price must be a non-negative number' }, { status: 400 });
  if (!Number.isInteger(qty) || qty < 0) return NextResponse.json({ error: 'Stock must be a non-negative integer' }, { status: 400 });

  const resolvedCategoryId = categoryId;
  const category = await prisma.category.findFirst({ where: { id: resolvedCategoryId, storeId: store.id } });
  if (!category) return NextResponse.json({ error: 'Category not found in your store' }, { status: 404 });

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        sku: sku?.trim() || null,
        buyPrice: buy,
        sellPrice: sell,
        stock: qty,
        categoryId: resolvedCategoryId,
      },
      include: { category: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ data: serializeProduct(product) });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A product with that SKU already exists in your store' }, { status: 409 });
    }
    throw err;
  }
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

  const product = await prisma.product.findFirst({
    where: { id: params.id, storeId: store.id },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  if (product._count.orderItems > 0) {
    return NextResponse.json(
      { error: 'Cannot delete: this product has order history' },
      { status: 409 }
    );
  }

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ data: { id: params.id } });
}
