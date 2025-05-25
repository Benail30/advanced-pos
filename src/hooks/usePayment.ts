import { useState } from 'react';
import { toast } from 'sonner';

interface PaymentData {
  method: 'cash' | 'card' | 'e_wallet';
  amount: number;
  changeAmount?: number;
}

interface UsePaymentResult {
  isProcessing: boolean;
  processPayment: (data: PaymentData) => Promise<void>;
  resetPayment: () => void;
}

export function usePayment(): UsePaymentResult {
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = async (data: PaymentData) => {
    setIsProcessing(true);
    try {
      // Simulate API call to process payment
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Here you would typically make an API call to your backend
      // const response = await fetch('/api/payments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      // if (!response.ok) throw new Error('Payment failed');

      toast.success('Payment processed successfully');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetPayment = () => {
    setIsProcessing(false);
  };

  return {
    isProcessing,
    processPayment,
    resetPayment,
  };
} 