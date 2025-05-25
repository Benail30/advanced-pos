'use client';

import { useState } from 'react';
import { CreditCard, Wallet, Banknote, Receipt, Gift } from 'lucide-react';

interface CheckoutProps {
  total: number;
  onComplete: (paymentDetails: PaymentDetails) => void;
}

interface PaymentDetails {
  method: 'cash' | 'credit_card' | 'debit_card' | 'e_wallet' | 'gift_card' | 'split_payment';
  amount: number;
  reference?: string;
  splitDetails?: {
    method: string;
    amount: number;
    reference?: string;
  }[];
}

export function Checkout({ total, onComplete }: CheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'credit_card' | 'debit_card' | 'e_wallet' | 'gift_card' | 'split_payment'>('cash');
  const [amount, setAmount] = useState(total);
  const [reference, setReference] = useState('');
  const [change, setChange] = useState(0);
  const [splitPayments, setSplitPayments] = useState<{
    method: string;
    amount: number;
    reference?: string;
  }[]>([]);
  const [remainingAmount, setRemainingAmount] = useState(total);

  const handleAmountChange = (value: string) => {
    const newAmount = parseFloat(value) || 0;
    setAmount(newAmount);
    if (selectedMethod === 'cash') {
      setChange(Math.max(0, newAmount - total));
    }
  };

  const handleSplitPaymentAdd = () => {
    setSplitPayments([...splitPayments, { method: 'cash', amount: 0 }]);
  };

  const handleSplitPaymentChange = (index: number, field: string, value: string | number) => {
    const newSplitPayments = [...splitPayments];
    newSplitPayments[index] = {
      ...newSplitPayments[index],
      [field]: value
    };
    setSplitPayments(newSplitPayments);
    
    const totalPaid = newSplitPayments.reduce((sum, payment) => sum + payment.amount, 0);
    setRemainingAmount(total - totalPaid);
  };

  const handlePayment = () => {
    if (selectedMethod === 'split_payment') {
      onComplete({
        method: 'split_payment',
        amount: total,
        splitDetails: splitPayments
      });
    } else {
      onComplete({
        method: selectedMethod,
        amount: selectedMethod === 'cash' ? amount : total,
        reference: selectedMethod !== 'cash' ? reference : undefined
      });
    }
  };

  const isPaymentValid = () => {
    if (selectedMethod === 'split_payment') {
      return remainingAmount <= 0 && splitPayments.length > 0;
    }
    if (selectedMethod === 'cash') {
      return amount >= total;
    }
    return !!reference;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Payment</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">Total Amount</p>
        <p className="text-2xl font-bold">${total.toFixed(2)}</p>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-2">Payment Method</p>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedMethod('cash')}
            className={`p-4 rounded-lg border-2 flex flex-col items-center ${
              selectedMethod === 'cash'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Banknote className="w-6 h-6 mb-2" />
            <span>Cash</span>
          </button>
          <button
            onClick={() => setSelectedMethod('credit_card')}
            className={`p-4 rounded-lg border-2 flex flex-col items-center ${
              selectedMethod === 'credit_card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCard className="w-6 h-6 mb-2" />
            <span>Credit Card</span>
          </button>
          <button
            onClick={() => setSelectedMethod('debit_card')}
            className={`p-4 rounded-lg border-2 flex flex-col items-center ${
              selectedMethod === 'debit_card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Banknote className="w-6 h-6 mb-2" />
            <span>Debit Card</span>
          </button>
          <button
            onClick={() => setSelectedMethod('e_wallet')}
            className={`p-4 rounded-lg border-2 flex flex-col items-center ${
              selectedMethod === 'e_wallet'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Wallet className="w-6 h-6 mb-2" />
            <span>E-Wallet</span>
          </button>
          <button
            onClick={() => setSelectedMethod('gift_card')}
            className={`p-4 rounded-lg border-2 flex flex-col items-center ${
              selectedMethod === 'gift_card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Gift className="w-6 h-6 mb-2" />
            <span>Gift Card</span>
          </button>
          <button
            onClick={() => setSelectedMethod('split_payment')}
            className={`p-4 rounded-lg border-2 flex flex-col items-center ${
              selectedMethod === 'split_payment'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-6 h-6 mb-2 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
              <span className="text-xs">+</span>
              <CreditCard className="w-4 h-4" />
            </div>
            <span>Split Payment</span>
          </button>
        </div>
      </div>

      {selectedMethod === 'cash' ? (
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Amount Received</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={total}
            step="0.01"
          />
          {change > 0 && (
            <p className="mt-2 text-green-600">
              Change: ${change.toFixed(2)}
            </p>
          )}
        </div>
      ) : selectedMethod === 'split_payment' ? (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">Remaining Amount: ${remainingAmount.toFixed(2)}</p>
            <button
              onClick={handleSplitPaymentAdd}
              className="text-blue-500 hover:text-blue-600"
            >
              + Add Payment
            </button>
          </div>
          {splitPayments.map((payment, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex gap-4 mb-2">
                <select
                  value={payment.method}
                  onChange={(e) => handleSplitPaymentChange(index, 'method', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                >
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="e_wallet">E-Wallet</option>
                  <option value="gift_card">Gift Card</option>
                </select>
                <input
                  type="number"
                  value={payment.amount}
                  onChange={(e) => handleSplitPaymentChange(index, 'amount', parseFloat(e.target.value) || 0)}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  placeholder="Amount"
                  min="0"
                  step="0.01"
                />
              </div>
              {payment.method !== 'cash' && (
                <input
                  type="text"
                  value={payment.reference || ''}
                  onChange={(e) => handleSplitPaymentChange(index, 'reference', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mt-2"
                  placeholder="Reference Number"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">
            {selectedMethod === 'credit_card' || selectedMethod === 'debit_card' 
              ? 'Card Number' 
              : selectedMethod === 'gift_card'
                ? 'Gift Card Number'
                : 'Transaction Reference'}
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              selectedMethod === 'credit_card' || selectedMethod === 'debit_card'
                ? '1234 5678 9012 3456'
                : selectedMethod === 'gift_card'
                  ? 'Enter gift card number'
                  : 'Enter reference number'
            }
          />
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={!isPaymentValid()}
        className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Receipt className="w-5 h-5" />
        Complete Payment
      </button>
    </div>
  );
} 