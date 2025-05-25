'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Package, X } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  reorder_point: number;
  category: string;
  price: number;
  image_url: string;
}

export default function LowStockAlert() {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchLowStockProducts();
    // Refresh every 5 minutes
    const interval = setInterval(fetchLowStockProducts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const response = await axios.get('/api/products/low-stock');
      setLowStockProducts(response.data);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-red-100 max-w-md">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Low Stock Alert</h3>
              <p className="text-sm text-gray-500">
                {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} need{lowStockProducts.length !== 1 ? '' : 's'} attention
              </p>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t border-gray-100">
            <div className="max-h-96 overflow-y-auto">
              {lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/pos/products/${product.id}`}
                  className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Image
                      src={product.image_url || '/images/default-product.png'}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                      <span className="text-sm text-red-600 font-medium">
                        {product.stock_quantity} left
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      <p className="text-xs text-gray-500">
                        Reorder at: {product.reorder_point}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <Link
                href="/pos/products"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all products →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 