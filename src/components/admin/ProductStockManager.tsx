import { useState } from 'react';
import { toast } from 'sonner';
import { useStock } from '@/hooks/useStock';
import { AlertTriangle, Package, Plus, Minus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  minStockLevel: number;
}

interface ProductStockManagerProps {
  product: Product;
  onStockUpdate: () => void;
}

export function ProductStockManager({ product, onStockUpdate }: ProductStockManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(product.stockQuantity);
  const [isLoading, setIsLoading] = useState(false);
  const { updateStock } = useStock();

  const isLowStock = product.stockQuantity <= product.minStockLevel;

  const handleStockUpdate = async (type: 'adjustment' | 'restock', change: number) => {
    setIsLoading(true);
    try {
      const result = await updateStock(
        product.id,
        Math.abs(change),
        type,
        `${type === 'restock' ? 'Restocked' : 'Adjusted'} stock by ${change} units`
      );

      if (result) {
        toast.success(`Stock ${type === 'restock' ? 'restocked' : 'adjusted'} successfully`);
        onStockUpdate();
      }
    } catch (error) {
      console.error('Stock update error:', error);
      toast.error('Failed to update stock');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">
            {product.name}
          </span>
          {isLowStock && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
        </div>
        <div className="mt-1 text-sm text-gray-500">
          SKU: {product.sku}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleStockUpdate('adjustment', -1)}
          disabled={isLoading || product.stockQuantity <= 0}
          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="h-4 w-4 text-gray-500" />
        </button>

        <div className="w-16 text-center">
          <span className={`text-sm font-medium ${isLowStock ? 'text-amber-600' : 'text-gray-900'}`}>
            {product.stockQuantity}
          </span>
          {isLowStock && (
            <div className="text-xs text-amber-600">
              Min: {product.minStockLevel}
            </div>
          )}
        </div>

        <button
          onClick={() => handleStockUpdate('restock', 1)}
          disabled={isLoading}
          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
} 