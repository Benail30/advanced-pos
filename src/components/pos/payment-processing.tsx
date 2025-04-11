'use client';

import { useState } from 'react';
import { CreditCard, Wallet, Banknote, Check, X, AlertCircle } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'cash' | 'credit_card' | 'debit_card' | 'e_wallet' | 'bank_transfer';
  label: string;
  icon: React.ReactNode;
}

interface PaymentProcessingProps {
  totalAmount: number;
  onPaymentComplete: (payment: {
    method: string;
    amount: number;
    reference?: string;
  }) => void;
  onCancel: () => void;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'cash',
    type: 'cash',
    label: 'Cash',
    icon: <Banknote className="w-6 h-6" />
  },
  {
    id: 'credit_card',
    type: 'credit_card',
    label: 'Credit Card',
    icon: <CreditCard className="w-6 h-6" />
  },
  {
    id: 'debit_card',
    type: 'debit_card',
    label: 'Debit Card',
    icon: <CreditCard className="w-6 h-6" />
  },
  {
    id: 'e_wallet',
    type: 'e_wallet',
    label: 'E-Wallet',
    icon: <Wallet className="w-6 h-6" />
  },
  {
    id: 'bank_transfer',
    type: 'bank_transfer',
    label: 'Bank Transfer',
    icon: <Wallet className="w-6 h-6" />
  }
];

export function PaymentProcessing({
  totalAmount,
  onPaymentComplete,
  onCancel
}: PaymentProcessingProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState<number>(totalAmount);
  const [reference, setReference] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handlePayment = () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (amount > totalAmount) {
      setError('Amount cannot exceed total');
      return;
    }

    onPaymentComplete({
      method: selectedMethod,
      amount,
      reference: reference.trim() || undefined
    });
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setError('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Payment Processing</h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-1">Total Amount</div>
        <div className="text-3xl font-bold">${totalAmount.toFixed(2)}</div>
      </div>

      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-3">Payment Method</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {paymentMethods.map(method => (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {method.icon}
              <span className="mt-2 text-sm font-medium">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-md"
          min="0"
          max={totalAmount}
          step="0.01"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reference Number (Optional)
        </label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter reference number"
        />
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Process Payment
        </button>
      </div>

      {/* Payment Method Specific Forms */}
      {selectedMethod === 'credit_card' && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Credit Card Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Card Number</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Expiry Date</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">CVV</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="123"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMethod === 'e_wallet' && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-4">E-Wallet Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Wallet ID</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter wallet ID"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">PIN</label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter PIN"
              />
            </div>
          </div>
        </div>
      )}

      {selectedMethod === 'bank_transfer' && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Bank Transfer Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Account Number</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter account number"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bank Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter bank name"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 