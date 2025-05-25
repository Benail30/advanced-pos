import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CreditCard, Wallet, Banknote, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onPaymentComplete: (paymentData: {
    method: 'cash' | 'card' | 'e_wallet';
    amount: number;
    changeAmount?: number;
  }) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  total,
  onPaymentComplete,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'e_wallet'>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleCashAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setCashAmount(value);
    }
  };

  const calculateChange = () => {
    const amount = parseFloat(cashAmount);
    if (isNaN(amount)) return 0;
    return Math.max(0, amount - total);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const paymentData = {
        method: selectedMethod,
        amount: selectedMethod === 'cash' ? parseFloat(cashAmount) : total,
        changeAmount: selectedMethod === 'cash' ? calculateChange() : undefined,
      };

      onPaymentComplete(paymentData);
      setIsComplete(true);
      toast.success('Payment processed successfully');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedMethod('cash');
    setCashAmount('');
    setIsComplete(false);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                {!isComplete ? (
                  <>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 mb-4"
                    >
                      Payment Details
                    </Dialog.Title>

                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${total.toFixed(2)}
                      </p>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Payment Method</p>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setSelectedMethod('cash')}
                          className={`flex flex-col items-center p-3 rounded-lg border ${
                            selectedMethod === 'cash'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <Banknote className="h-6 w-6 mb-1" />
                          <span className="text-sm">Cash</span>
                        </button>
                        <button
                          onClick={() => setSelectedMethod('card')}
                          className={`flex flex-col items-center p-3 rounded-lg border ${
                            selectedMethod === 'card'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <CreditCard className="h-6 w-6 mb-1" />
                          <span className="text-sm">Card</span>
                        </button>
                        <button
                          onClick={() => setSelectedMethod('e_wallet')}
                          className={`flex flex-col items-center p-3 rounded-lg border ${
                            selectedMethod === 'e_wallet'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <Wallet className="h-6 w-6 mb-1" />
                          <span className="text-sm">E-Wallet</span>
                        </button>
                      </div>
                    </div>

                    {selectedMethod === 'cash' && (
                      <div className="mb-6">
                        <label
                          htmlFor="cashAmount"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Amount Received
                        </label>
                        <input
                          type="text"
                          id="cashAmount"
                          value={cashAmount}
                          onChange={handleCashAmountChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="0.00"
                        />
                        {cashAmount && (
                          <p className="mt-2 text-sm text-gray-500">
                            Change: ${calculateChange().toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handlePayment}
                        disabled={isProcessing || (selectedMethod === 'cash' && !cashAmount)}
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : 'Complete Payment'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 mb-2"
                    >
                      Payment Successful
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mb-6">
                      Thank you for your purchase!
                    </p>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Close
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 