import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface StockCheck {
  isAvailable: boolean;
  isLowStock: boolean;
  currentStock: number;
  minStockLevel: number;
}

interface StockUpdate {
  previousQuantity: number;
  newQuantity: number;
  changeQuantity: number;
}

export function useStock() {
  const [isLoading, setIsLoading] = useState(false);

  const checkStock = useCallback(async (productId: string, quantity: number): Promise<StockCheck | null> => {
    try {
      const response = await fetch(
        `/api/stock?productId=${productId}&quantity=${quantity}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to check stock');
      }

      return await response.json();
    } catch (error) {
      console.error('Stock check error:', error);
      toast.error('Failed to check stock availability');
      return null;
    }
  }, []);

  const updateStock = useCallback(async (
    productId: string,
    quantity: number,
    type: 'sale' | 'adjustment' | 'restock',
    notes?: string,
    metadata?: Record<string, unknown>
  ): Promise<StockUpdate | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity,
          type,
          notes,
          metadata,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update stock');
      }

      const result = await response.json();
      
      // Show appropriate toast message
      if (type === 'sale') {
        toast.success('Stock updated after sale');
      } else if (type === 'restock') {
        toast.success('Stock restocked successfully');
      } else {
        toast.success('Stock adjusted successfully');
      }

      return result;
    } catch (error) {
      console.error('Stock update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update stock');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStockHistory = useCallback(async (
    productId: string,
    limit: number = 10
  ) => {
    try {
      const response = await fetch(
        `/api/stock?productId=${productId}&limit=${limit}`,
        { method: 'PUT' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stock history');
      }

      return await response.json();
    } catch (error) {
      console.error('Stock history error:', error);
      toast.error('Failed to fetch stock history');
      return null;
    }
  }, []);

  return {
    isLoading,
    checkStock,
    updateStock,
    getStockHistory,
  };
} 