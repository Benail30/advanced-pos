import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  transactionId: string;
  invoiceNumber: string;
  qrCode: string;
  pdfUrl: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function useInvoice() {
  const [isLoading, setIsLoading] = useState(false);

  const generateInvoice = useCallback(async (transactionId: string): Promise<Invoice | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate invoice');
      }

      const invoice = await response.json();
      toast.success('Invoice generated successfully');
      return invoice;
    } catch (error) {
      console.error('Invoice generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate invoice');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getInvoice = useCallback(async (
    transactionId?: string,
    invoiceNumber?: string
  ): Promise<Invoice | null> => {
    if (!transactionId && !invoiceNumber) {
      toast.error('Either transactionId or invoiceNumber is required');
      return null;
    }

    try {
      const params = new URLSearchParams();
      if (transactionId) params.append('transactionId', transactionId);
      if (invoiceNumber) params.append('invoiceNumber', invoiceNumber);

      const response = await fetch(`/api/invoices?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch invoice');
      }

      return await response.json();
    } catch (error) {
      console.error('Invoice fetch error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch invoice');
      return null;
    }
  }, []);

  const downloadInvoice = useCallback(async (pdfUrl: string) => {
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Invoice download error:', error);
      toast.error('Failed to download invoice');
    }
  }, []);

  return {
    isLoading,
    generateInvoice,
    getInvoice,
    downloadInvoice,
  };
} 