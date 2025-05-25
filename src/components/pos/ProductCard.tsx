import { useState } from 'react';
import { toast } from 'sonner';
import { useStock } from '@/hooks/useStock';
import { AlertTriangle, Package } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  minStockLevel: number;
  imageUrl?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { checkStock } = useStock();
  const isLowStock = product.stockQuantity <= product.minStockLevel;
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = async () => {
    try {
      const stockCheck = await checkStock(product.id, quantity);
      
      if (!stockCheck) {
        toast.error('Failed to check stock availability');
        return;
      }

      if (!stockCheck.isAvailable) {
        toast.error(`Insufficient stock for ${product.name}`);
        return;
      }

      onAddToCart(product, quantity);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
      <div className="aspect-square relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={product.imageUrl || '/images/default-product.png'}
          alt={product.name}
          width={200}
          height={200}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center space-x-1">
            {isLowStock && !isOutOfStock && (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
            <span className={`text-sm font-medium ${isLowStock ? 'text-amber-600' : 'text-gray-500'}`}>
              {product.stockQuantity} in stock
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max={product.stockQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 text-sm border border-gray-200 rounded"
              disabled={isOutOfStock}
            />
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 