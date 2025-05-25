'use client';

import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onCheckout: () => void;
}

export function ShoppingCart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          total,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process transaction');
      }

      const data = await response.json();
      // Handle successful transaction
      clearCart();
      // Show success message or redirect to receipt
    } catch (error) {
      console.error('Error processing transaction:', error);
      // Show error message
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
      
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Cart is empty</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                {item.image && (
                  <div className="relative w-16 h-16">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-500">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
                    }
                    className="w-20"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between mb-4">
          <span className="font-medium">Total:</span>
          <span className="font-bold">${total.toFixed(2)}</span>
        </div>
        <Button
          className="w-full"
          onClick={handleCheckout}
          disabled={items.length === 0}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
} 