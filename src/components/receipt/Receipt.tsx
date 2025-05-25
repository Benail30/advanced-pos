import { format } from 'date-fns';
import { Receipt as ReceiptIcon } from 'lucide-react';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface ReceiptProps {
  transactionId: number;
  customerName: string;
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashAmount?: number;
  change?: number;
  splitPayments?: {
    method: string;
    amount: number;
  }[];
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

export default function Receipt({
  transactionId,
  customerName,
  date,
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  cashAmount,
  change,
  splitPayments,
  storeName = "Advanced POS Store",
  storeAddress = "123 Main Street, City, State 12345",
  storePhone = "(555) 123-4567"
}: ReceiptProps) {
  return (
    <div className="w-[300px] bg-white p-4 font-mono text-sm" id="receipt">
      {/* Store Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">{storeName}</h1>
        <p className="text-xs">{storeAddress}</p>
        <p className="text-xs">{storePhone}</p>
      </div>

      {/* Transaction Info */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span>Receipt #:</span>
          <span>{transactionId}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Date:</span>
          <span>{format(new Date(date), 'MM/dd/yyyy HH:mm:ss')}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Customer:</span>
          <span>{customerName}</span>
        </div>
      </div>

      {/* Items */}
      <div className="mb-4">
        <div className="border-b border-dashed border-gray-400 mb-2 pb-1">
          <div className="grid grid-cols-12 text-xs font-bold">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-4 text-right">Price</div>
          </div>
        </div>
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 text-xs mb-1">
            <div className="col-span-6">{item.name}</div>
            <div className="col-span-2 text-right">{item.quantity}</div>
            <div className="col-span-4 text-right">${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Tax:</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-dashed border-gray-400 pt-1 mt-1">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Details */}
      <div className="mb-4">
        <div className="border-t border-dashed border-gray-400 pt-2">
          <div className="flex justify-between mb-1">
            <span>Payment Method:</span>
            <span>{paymentMethod === 'split' ? 'Split Payment' : paymentMethod}</span>
          </div>
          {cashAmount && (
            <>
              <div className="flex justify-between mb-1">
                <span>Cash Amount:</span>
                <span>${cashAmount.toFixed(2)}</span>
              </div>
              {change && (
                <div className="flex justify-between mb-1">
                  <span>Change:</span>
                  <span>${change.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
          {splitPayments && splitPayments.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-bold mb-1">Split Payments:</div>
              {splitPayments.map((payment, index) => (
                <div key={index} className="flex justify-between text-xs mb-1">
                  <span>{payment.method}:</span>
                  <span>${payment.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs">
        <p>Thank you for your purchase!</p>
        <p className="mt-1">Please come again</p>
        <div className="mt-2 flex justify-center">
          <ReceiptIcon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
} 