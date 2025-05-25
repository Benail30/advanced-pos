'use client';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import type { UseReactToPrintOptions } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface ReceiptProps {
  transaction: {
    id: string;
    transaction_number: string;
    created_at: string;
    items: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }>;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    payment_method: string;
  };
}

export function Receipt({ transaction }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: 'Receipt',
    pageStyle: `
      @page {
        size: 80mm 297mm;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
    content: () => receiptRef.current,
  } as UseReactToPrintOptions);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div ref={receiptRef} className="max-w-sm mx-auto">
        {/* Receipt Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">Your Store Name</h2>
          <p className="text-sm text-gray-500">123 Store Street</p>
          <p className="text-sm text-gray-500">Phone: (123) 456-7890</p>
        </div>

        {/* Transaction Info */}
        <div className="border-t border-b py-2 mb-4">
          <p className="text-sm">
            Receipt #: {transaction.transaction_number}
          </p>
          <p className="text-sm">
            Date: {new Date(transaction.created_at).toLocaleString()}
          </p>
        </div>

        {/* Items */}
        <div className="mb-4">
          <div className="grid grid-cols-12 text-sm font-medium mb-2">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          {transaction.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 text-sm mb-1">
              <div className="col-span-6">{item.name}</div>
              <div className="col-span-2 text-right">{item.quantity}</div>
              <div className="col-span-2 text-right">
                ${item.unit_price.toFixed(2)}
              </div>
              <div className="col-span-2 text-right">
                ${item.subtotal.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t pt-2 mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal:</span>
            <span>${transaction.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Tax (10%):</span>
            <span>${transaction.tax_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>${transaction.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="border-t pt-2 mb-4">
          <p className="text-sm">
            Payment Method: {transaction.payment_method}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Thank you for your purchase!</p>
          <p>Please come again</p>
        </div>
      </div>

      {/* Print Button */}
      <div className="mt-4 flex justify-center">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>
      </div>
    </div>
  );
} 