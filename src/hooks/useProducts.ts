import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  stockQuantity: number;
  minStockLevel: number;
}

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  stockChanged: boolean;
  lastUpdate: Date | null;
}

export function useProducts(pollInterval = 7000): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockChanged, setStockChanged] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const prevProductsRef = useRef<Product[]>([]);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to compare stock
  const hasStockChanged = (prev: Product[], next: Product[]) => {
    if (prev.length !== next.length) return true;
    for (let i = 0; i < prev.length; i++) {
      if (prev[i].stockQuantity !== next[i].stockQuantity) return true;
    }
    return false;
  };

  const fetchProducts = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      // Only update if stock changed
      if (hasStockChanged(prevProductsRef.current, data)) {
        setProducts(data);
        setStockChanged(true);
        setLastUpdate(new Date());
        prevProductsRef.current = data;
        toast.success('Stock updated');
      } else {
        setStockChanged(false);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    // Initial fetch
    fetchProducts(true);

    const poll = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        fetchProducts(false);
      }
    };

    pollingRef.current = setInterval(poll, pollInterval);

    // Pause polling when tab is hidden
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [pollInterval]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, stockChanged, lastUpdate };
} 