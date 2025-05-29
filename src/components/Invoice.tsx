'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Download, Mail, X } from 'lucide-react';

interface InvoiceItem {
  id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  transaction_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  invoice_date: string;
  due_date: string;
  status: string;
  payment_method: string;
  qr_code_data: string;
  items: InvoiceItem[];
}

interface InvoiceProps {
  invoice: InvoiceData;
  onClose?: () => void;
  showActions?: boolean;
}

export default function Invoice({ invoice, onClose, showActions = true }: InvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            .invoice-container { 
              max-width: 800px; 
              margin: 0 auto; 
              background: white;
            }
            .print-hide { display: none !important; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .text-right { text-align: right; }
            .text-center { text-center: center; }
            .font-bold { font-weight: bold; }
            .text-lg { font-size: 1.125rem; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .gap-4 { gap: 1rem; }
            .border-t { border-top: 2px solid #000; }
            .pt-4 { padding-top: 1rem; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownload = () => {
    // This would generate a PDF - for now just trigger print
    handlePrint();
  };

  const handleEmail = () => {
    const subject = `Invoice ${invoice.invoice_number}`;
    const body = `Please find attached invoice ${invoice.invoice_number} for the amount of $${invoice.total_amount.toFixed(2)}.`;
    
    if (invoice.customer_email) {
      window.open(`mailto:${invoice.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else {
      alert('No customer email available for this invoice.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        
        {/* Action Bar */}
        {showActions && (
          <div className="flex items-center justify-between p-4 border-b print-hide">
            <h2 className="text-xl font-bold text-gray-900">Invoice {invoice.invoice_number}</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              {invoice.customer_email && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmail}
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
              )}
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Close
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Invoice Content */}
        <div ref={printRef} className="invoice-container p-8">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <div className="text-gray-600">
                <p className="text-lg font-semibold">Advanced POS System</p>
                <p>123 Business Street</p>
                <p>City, State 12345</p>
                <p>Phone: (555) 123-4567</p>
                <p>Email: info@advanced-pos.com</p>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="text-xl font-bold">{invoice.invoice_number}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Invoice Date</p>
                <p className="font-semibold">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-semibold">{new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
              {invoice.qr_code_data && (
                <div className="flex justify-end">
                  <img 
                    src={invoice.qr_code_data} 
                    alt="Invoice QR Code" 
                    className="w-24 h-24 border rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
              <div className="text-gray-700">
                <p className="font-semibold">{invoice.customer_name || 'Walk-in Customer'}</p>
                {invoice.customer_email && <p>{invoice.customer_email}</p>}
                {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
                {invoice.customer_address && <p>{invoice.customer_address}</p>}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Payment Info:</h3>
              <div className="text-gray-700">
                <p><span className="font-medium">Method:</span> {(invoice.payment_method || 'cash').toUpperCase()}</p>
                <p><span className="font-medium">Status:</span> <span className="text-green-600 font-semibold">{(invoice.status || 'paid').toUpperCase()}</span></p>
                <p><span className="font-medium">Transaction ID:</span> {invoice.transaction_id}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Item</th>
                  <th className="border border-gray-300 p-3 text-left">SKU</th>
                  <th className="border border-gray-300 p-3 text-center">Qty</th>
                  <th className="border border-gray-300 p-3 text-right">Unit Price</th>
                  <th className="border border-gray-300 p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 p-3">{item.product_name}</td>
                    <td className="border border-gray-300 p-3 text-gray-600">{item.sku}</td>
                    <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-3 text-right">${item.unit_price.toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-right font-semibold">${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-${invoice.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8.25%):</span>
                  <span className="font-semibold">${invoice.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">${invoice.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-300 pt-4 text-center text-gray-600 text-sm">
            <p className="mb-2">Thank you for your business!</p>
            <p>For questions about this invoice, please contact us at info@advanced-pos.com or (555) 123-4567</p>
            <p className="mt-2 text-xs">This invoice was generated automatically by Advanced POS System</p>
          </div>
        </div>
      </div>
    </div>
  );
} 