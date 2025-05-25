import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock_quantity?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  error: string | null;
  clearError: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      error: null,
      addItem: (item) => {
        try {
          const currentItems = get().items;
          const existingItem = currentItems.find((i) => i.id === item.id);

          // Validate input
          if (!item || typeof item.quantity !== 'number' || item.quantity < 1) {
            set({ error: 'Invalid item quantity' });
            return;
          }

          // Validate stock quantity
          if (item.stock_quantity !== undefined && item.quantity > item.stock_quantity) {
            set({ error: `Only ${item.stock_quantity} items available in stock` });
            return;
          }

          if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            if (item.stock_quantity !== undefined && newQuantity > item.stock_quantity) {
              set({ error: `Cannot add more items. Only ${item.stock_quantity} available in stock` });
              return;
            }
            set({
              items: currentItems.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: newQuantity }
                  : i
              ),
              error: null,
            });
          } else {
            set({ items: [...currentItems, item], error: null });
          }
        } catch (error) {
          console.error('Error adding item to cart:', error);
          set({ error: 'Failed to add item to cart' });
        }
      },
      removeItem: (itemId) => {
        try {
          set({ 
            items: get().items.filter((item) => item.id !== itemId),
            error: null 
          });
        } catch (error) {
          console.error('Error removing item from cart:', error);
          set({ error: 'Failed to remove item from cart' });
        }
      },
      updateQuantity: (itemId, quantity) => {
        try {
          const item = get().items.find(i => i.id === itemId);
          if (!item) {
            set({ error: 'Item not found in cart' });
            return;
          }

          if (typeof quantity !== 'number' || quantity < 1) {
            set({ error: 'Quantity must be at least 1' });
            return;
          }

          if (item.stock_quantity !== undefined && quantity > item.stock_quantity) {
            set({ error: `Only ${item.stock_quantity} items available in stock` });
            return;
          }

          set({
            items: get().items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
            error: null,
          });
        } catch (error) {
          console.error('Error updating item quantity:', error);
          set({ error: 'Failed to update item quantity' });
        }
      },
      clearCart: () => set({ items: [], error: null }),
      clearError: () => set({ error: null }),
      get total() {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
); 