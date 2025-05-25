'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, ArrowLeft, Search, Banknote, Smartphone, Gift, XIcon, Package } from 'lucide-react';
import { CSSProperties } from 'react';
import axios from 'axios';
import Receipt from '@/components/receipt/Receipt';
import { Printer } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Image from 'next/image';

// Add CSS for icons to ensure they are clickable
const iconStyle: CSSProperties = {
  display: 'inline-flex',
  pointerEvents: 'none' as const,
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  stock_quantity: number;
  category: string;
  sku: string;
  image_url: string;
}

interface TransactionItem {
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', name: 'Cash', icon: <Banknote className="h-5 w-5" /> },
  { id: 'card', name: 'Card', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'mobile', name: 'Mobile Pay', icon: <Smartphone className="h-5 w-5" /> },
  { id: 'gift', name: 'Gift Card', icon: <Gift className="h-5 w-5" /> },
];

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export default function RegisterPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerId, setCustomerId] = useState<string>('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();

  // Check authentication
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/api/auth/login?returnTo=/pos/register');
    }
  }, [user, isUserLoading, router]);

  // Fetch products and customers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, customersResponse] = await Promise.all([
          axios.get<Product[]>('/api/products'),
          axios.get<Customer[]>('/api/customers')
        ]);
        
        setProducts(productsResponse.data);
        setFilteredProducts(productsResponse.data);
        setCustomers(customersResponse.data);
        
        // Extract unique categories
        const categories = productsResponse.data.map((p: Product) => p.category) as string[];
        const uniqueCategories = ['All', ...Array.from(new Set(categories))];
        setCategories(uniqueCategories);
        
        // Check if no products exist
        if (productsResponse.data.length === 0) {
          setError('No products found in the database. Please contact your administrator.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on search query and category
  useEffect(() => {
    let filtered = [...products];
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
  const tax = subtotal * 0.0825; // 8.25% tax rate
  const total = subtotal + tax;

  // Add product to cart
  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      alert('This product is out of stock!');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock_quantity) {
          alert('Not enough stock available!');
          return prevCart;
        }
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  // Update cart item quantity
  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock_quantity) {
      alert('Not enough stock available!');
      return;
    }

    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  // Clear the entire cart
  const clearCart = () => {
    setCart([]);
    setCustomerId('');
    setIsCheckingOut(false);
    setSelectedPaymentMethod('');
    setCashAmount('');
  };

  // Calculate change for cash payments
  const calculateChange = () => {
    if (!cashAmount || !total) return 0;
    const cash = parseFloat(cashAmount);
    return cash - total;
  };

  // Print receipt
  const printReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                body { font-family: monospace; }
                .receipt { width: 300px; margin: 20px auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .items { margin: 20px 0; }
                .total { margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px; }
              </style>
            </head>
            <body>
              <div class="receipt">
                ${receiptRef.current.innerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // Handle customer form submission
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<Customer>('/api/customers', customerFormData);
      setCustomers(prev => [...prev, response.data]);
      setCustomerId(response.data.id);
      setShowCustomerForm(false);
      setCustomerFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer. Please try again.');
    }
  };

  // Process checkout
  const processCheckout = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (selectedPaymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total)) {
      alert('Please enter a valid cash amount');
      return;
    }

    try {
      const transactionData = {
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: parseFloat(item.product.price)
        })),
        customerId: customerId || null,
        paymentMethod: selectedPaymentMethod,
        cashAmount: selectedPaymentMethod === 'cash' ? parseFloat(cashAmount) : null,
        subtotal,
        tax,
        total
      };

      const response = await axios.post('/api/transactions', transactionData);
      setCurrentTransaction(response.data);
      setShowReceipt(true);
      clearCart();
    } catch (error) {
      console.error('Error processing transaction:', error);
      alert('Failed to process transaction. Please try again.');
    }
  };

  // Receipt Modal Component
  const ReceiptModal = () => {
    if (!showReceipt || !currentTransaction) return null;

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Transaction Complete</h3>
              <button
                onClick={() => setShowReceipt(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div ref={receiptRef}>
              <Receipt
                transactionId={currentTransaction.id}
                customerName={currentTransaction.customer_name || 'Walk-in Customer'}
                date={currentTransaction.created_at}
                items={currentTransaction.items.map((item: TransactionItem) => ({
                  name: item.name,
                  quantity: item.quantity,
                  price: item.unit_price
                }))}
                subtotal={currentTransaction.subtotal}
                tax={currentTransaction.tax_amount}
                total={currentTransaction.total_amount}
                paymentMethod={currentTransaction.payment_method}
                cashAmount={currentTransaction.cash_amount}
                change={currentTransaction.change_amount}
                splitPayments={currentTransaction.split_payments}
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowReceipt(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Close
              </button>
              <button
                onClick={printReceipt}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/pos" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
              <span style={iconStyle}><ArrowLeft className="h-5 w-5 mr-2" /></span>
              <span className="font-medium">Back to POS</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold text-gray-900">New Sale</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and filters */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span style={iconStyle}><Search className="h-5 w-5 text-gray-400" /></span>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    autoFocus
                    aria-label="Search products"
                  />
                </div>
                
                <div className="w-full sm:w-auto">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Products grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock_quantity <= 0}
                  className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all text-left ${
                    product.stock_quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <Image
                      src={product.image_url || '/images/default-product.png'}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{product.category}</p>
                  <p className="text-lg font-semibold text-blue-600 mt-1">
                    ${parseFloat(product.price).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stock: {product.stock_quantity}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Sale</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium mb-2">Your cart is empty</p>
                  <p className="text-gray-400 text-sm">Start adding products to begin a sale</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                          <p className="text-sm text-gray-500">${parseFloat(item.product.price).toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-gray-500"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-gray-900 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-gray-500"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1 text-red-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (8.25%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {!isCheckingOut ? (
                    <button
                      onClick={() => setIsCheckingOut(true)}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-6"
                    >
                      Proceed to Checkout
                    </button>
                  ) : (
                    <div className="space-y-4 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Customer
                        </label>
                        <select
                          value={customerId}
                          onChange={(e) => setCustomerId(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">No Customer</option>
                          {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                              {customer.first_name} {customer.last_name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setShowCustomerForm(true)}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          + Add New Customer
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {PAYMENT_METHODS.map((method) => (
                            <button
                              key={method.id}
                              onClick={() => setSelectedPaymentMethod(method.id)}
                              className={`flex items-center justify-center space-x-2 p-3 rounded-lg border ${
                                selectedPaymentMethod === method.id
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-300 hover:border-blue-300'
                              }`}
                            >
                              {method.icon}
                              <span>{method.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {selectedPaymentMethod === 'cash' && (
                        <div className="mt-3">
                          <label htmlFor="cashAmount" className="block text-sm font-medium text-gray-700 mb-1">
                            Cash Amount
                          </label>
                          <input
                            type="number"
                            id="cashAmount"
                            value={cashAmount}
                            onChange={(e) => setCashAmount(e.target.value)}
                            placeholder="Enter cash amount"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          {cashAmount && (
                            <div className="mt-2 text-sm">
                              <p>Change: ${calculateChange().toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={() => setIsCheckingOut(false)}
                          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={processCheckout}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Complete Sale
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Customer</h3>
              <form onSubmit={handleCustomerSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      required
                      value={customerFormData.first_name}
                      onChange={(e) => setCustomerFormData({ ...customerFormData, first_name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      required
                      value={customerFormData.last_name}
                      onChange={(e) => setCustomerFormData({ ...customerFormData, last_name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={customerFormData.email}
                      onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={customerFormData.phone}
                      onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCustomerForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Add Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ReceiptModal />
    </div>
  );
} 