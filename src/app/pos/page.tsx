'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShoppingCart, Search, Package, Plus, Minus, Trash2,
  CreditCard, Banknote, Smartphone, CheckCircle, X,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
}

interface CartItem extends Product { quantity: number; }

type PaymentMethod = 'CASH' | 'CARD' | 'NFC';

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'CASH', label: 'Cash', icon: <Banknote className="w-5 h-5" /> },
  { value: 'CARD', label: 'Card', icon: <CreditCard className="w-5 h-5" /> },
  { value: 'NFC', label: 'NFC', icon: <Smartphone className="w-5 h-5" /> },
];

export default function POSPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{ id: string; total: number } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/cashier/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/products')
      .then(r => r.json())
      .then(result => {
        if (result.data) {
          const mapped: Product[] = result.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.sellPrice,
            stock: item.stock ?? 0,
            category: item.category?.name ?? 'Uncategorized',
            imageUrl: item.imageUrl ?? null,
          }));
          setProducts(mapped);
          const cats = Array.from(new Set(mapped.map(p => p.category))) as string[];
          setCategories(['All', ...cats]);
        }
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));
  }, [status]);

  const filteredProducts = useMemo(() =>
    products.filter(p =>
      (activeCategory === 'All' || p.category === activeCategory) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    ), [products, activeCategory, search]);

  function addToCart(product: Product) {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.id !== id)); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.min(qty, i.stock) } : i));
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  async function handleValidate() {
    if (cart.length === 0) return;
    setProcessing(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(i => ({ productId: i.id, quantity: i.quantity })),
        customerName: customerName.trim() || null,
        paymentMethod,
      }),
    });
    const json = await res.json();
    setProcessing(false);

    if (!res.ok) { alert(json.error ?? 'Failed to create order'); return; }

    // Update local stock
    setProducts(prev => prev.map(p => {
      const item = cart.find(c => c.id === p.id);
      return item ? { ...p, stock: p.stock - item.quantity } : p;
    }));

    setCompletedOrder({ id: json.data.id, total: json.data.total });
    setShowCheckout(false);
  }

  function startNewSale() {
    setCart([]);
    setCustomerName('');
    setPaymentMethod('CASH');
    setCompletedOrder(null);
  }

  if (status === 'loading' || loadingProducts) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const receiptUrl = completedOrder
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')}/receipt/${completedOrder.id}`
    : '';

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ── Left: Products ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 p-4 gap-3">

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Package className="h-12 w-12 mb-3" />
              <p className="text-sm">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="bg-white rounded-xl border p-3 text-left hover:border-blue-400 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="aspect-square rounded-lg bg-gray-100 mb-2 overflow-hidden flex items-center justify-center">
                    {product.imageUrl
                      ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      : <Package className="h-8 w-8 text-gray-300" />
                    }
                  </div>
                  <p className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">{product.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Stock: {product.stock}</p>
                  <p className="text-base font-bold text-blue-600 mt-1">${product.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Cart ──────────────────────────────────── */}
      <div className="w-80 bg-white border-l flex flex-col shrink-0">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-gray-500" />
            <span className="font-semibold text-gray-900">Cart</span>
            {cart.length > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2">{cart.length}</span>
            )}
          </div>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-600">Clear</button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <ShoppingCart className="h-10 w-10 mb-2" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="bg-gray-50 rounded-lg p-2.5">
              <div className="flex justify-between items-start gap-2 mb-1.5">
                <p className="text-sm font-medium text-gray-900 leading-tight flex-1">{item.name}</p>
                <button onClick={() => updateQty(item.id, 0)} className="text-gray-300 hover:text-red-500 shrink-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded border bg-white flex items-center justify-center hover:bg-gray-100">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-6 h-6 rounded border bg-white flex items-center justify-center hover:bg-gray-100 disabled:opacity-40">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-blue-600">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Customer name */}
        <div className="px-3 pb-2">
          <Input
            placeholder="Customer name (optional)"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Payment method */}
        <div className="px-3 pb-3 flex gap-2">
          {PAYMENT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPaymentMethod(opt.value)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                paymentMethod === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>

        {/* Total + Validate */}
        <div className="p-3 border-t space-y-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-blue-600">${subtotal.toFixed(2)}</span>
          </div>
          <Button
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-semibold"
          >
            Validate
          </Button>
        </div>
      </div>

      {/* ── Checkout confirmation modal ───────────────────── */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Confirm Order</h2>
            <div className="space-y-1 text-sm text-gray-600 max-h-40 overflow-y-auto">
              {cart.map(i => (
                <div key={i.id} className="flex justify-between">
                  <span>{i.name} × {i.quantity}</span>
                  <span>${(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {customerName && (
              <p className="text-sm text-gray-500">Customer: <span className="font-medium text-gray-800">{customerName}</span></p>
            )}
            <p className="text-sm text-gray-500">Payment: <span className="font-medium text-gray-800">{paymentMethod}</span></p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCheckout(false)} disabled={processing}>
                Back
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleValidate} disabled={processing}>
                {processing ? 'Processing…' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success + QR modal ───────────────────────────── */}
      {completedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-5 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Sale Complete!</h2>
              <p className="text-sm text-gray-500">Order #{completedOrder.id}</p>
              <p className="text-2xl font-bold text-green-600">${completedOrder.total.toFixed(2)}</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-gray-400">Customer scans to view receipt</p>
              <div className="p-3 bg-gray-50 rounded-xl border">
                <QRCodeSVG value={receiptUrl} size={160} />
              </div>
              <p className="text-xs text-gray-400 break-all">{receiptUrl}</p>
            </div>

            <Button onClick={startNewSale} className="w-full bg-blue-600 hover:bg-blue-700">
              New Sale
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
