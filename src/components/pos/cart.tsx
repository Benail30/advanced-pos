'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function Cart({ items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 8.25; // 8.25%
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 min-h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Cart</h2>
      </div>

      <div className="space-y-4 mb-6 flex-1 min-h-[calc(100vh-24rem)] overflow-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2 border-b">
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
              >
                −
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
              >
                +
              </button>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax ({taxRate}%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <Button
        className="w-full mt-6"
        size="lg"
        onClick={onCheckout}
        disabled={items.length === 0}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
} 