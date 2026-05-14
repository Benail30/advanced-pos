'use client';

import { Printer } from 'lucide-react';

interface ReceiptProps {
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentReference?: string;
  change?: number;
  transactionNumber: string;
  date: string;
  cashier: string;
}

export function Receipt({
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  paymentReference,
  change,
  transactionNumber,
  date,
  cashier
}: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">RECEIPT</h2>
        <p className="text-sm text-gray-600">Transaction #{transactionNumber}</p>
        <p className="text-sm text-gray-600">{date}</p>
        <p className="text-sm text-gray-600">Cashier: {cashier}</p>
      </div>

      <div className="border-t border-b border-gray-200 py-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between mb-2">
            <div>
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-600 ml-2">x{item.quantity}</span>
            </div>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Payment Method:</span>
          <span className="font-medium">{paymentMethod}</span>
        </div>
        {paymentReference && (
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Reference:</span>
            <span className="font-medium">{paymentReference}</span>
          </div>
        )}
        {change !== undefined && change > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Change:</span>
            <span className="font-medium text-green-600">${change.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Thank you for your purchase!</p>
        <p>Please come again</p>
      </div>

      <button
        onClick={handlePrint}
        className="mt-6 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
      >
        <Printer className="w-4 h-4" />
        Print Receipt
      </button>
    </div>
  );
} 