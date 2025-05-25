import { useState, useEffect } from 'react';
import { useStock } from '@/hooks/useStock';
import { format } from 'date-fns';
import { Package, ArrowUp, ArrowDown } from 'lucide-react';

interface StockHistoryItem {
  id: string;
  previousQuantity: number;
  newQuantity: number;
  changeQuantity: number;
  type: 'sale' | 'adjustment' | 'restock';
  notes: string | null;
  createdAt: string;
}

interface StockHistoryProps {
  productId: string;
}

export function StockHistory({ productId }: StockHistoryProps) {
  const [history, setHistory] = useState<StockHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getStockHistory } = useStock();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await getStockHistory(productId, 20);
        if (result) {
          setHistory(result);
        }
      } catch (error) {
        console.error('Error fetching stock history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [productId, getStockHistory]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="text-center p-4 text-gray-500">
        No stock history available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
          className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-100"
        >
          <div className="flex-shrink-0">
            {item.type === 'restock' ? (
              <ArrowUp className="h-5 w-5 text-green-500" />
            ) : item.type === 'sale' ? (
              <ArrowDown className="h-5 w-5 text-red-500" />
            ) : (
              <Package className="h-5 w-5 text-gray-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {item.type === 'restock' ? 'Stock Added' : 
                 item.type === 'sale' ? 'Stock Sold' : 'Stock Adjusted'}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>

            <div className="mt-1">
              <p className="text-sm text-gray-500">
                {item.notes || 'No notes provided'}
              </p>
            </div>

            <div className="mt-2 flex items-center space-x-4 text-sm">
              <div>
                <span className="text-gray-500">Previous:</span>{' '}
                <span className="font-medium">{item.previousQuantity}</span>
              </div>
              <div>
                <span className="text-gray-500">Change:</span>{' '}
                <span className={`font-medium ${
                  item.changeQuantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.changeQuantity > 0 ? '+' : ''}{item.changeQuantity}
                </span>
              </div>
              <div>
                <span className="text-gray-500">New:</span>{' '}
                <span className="font-medium">{item.newQuantity}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 