'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Search, Package, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react';
import Invoice from '@/components/Invoice';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function POSPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [lastTransactionNumber, setLastTransactionNumber] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (!user && !isLoading) {
      // Redirect to cashier login page
      router.push('/cashier-login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const result = await response.json();
        
        // Handle the API response format: { success: true, data: [...] }
        if (result.success && result.data) {
          // Transform API data to match POS page expectations
          const products: Product[] = result.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            stock: item.stock_quantity,
            category: item.category_name || 'Uncategorized'
          }));
          
          setProducts(products);
          
          // Extract unique categories
          const uniqueCategories = Array.from(new Set(products.map((p: Product) => p.category)));
          setCategories(['All', ...uniqueCategories]);
        } else {
          console.error('Invalid API response format:', result);
          setProducts([]); // Set empty array as fallback
          setCategories(['All']);
        }
        
        setIsLoadingProducts(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Set empty array and continue without redirecting
        setProducts([]);
        setCategories(['All']);
        setIsLoadingProducts(false);
      }
    };

    if (user) {
      fetchProducts();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const result = await response.json();
      if (result.success && result.data) {
        setCustomers(result.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const createNewCustomer = async () => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomerData)
      });
      
      const result = await response.json();
      if (result.success) {
        setSelectedCustomer(result.data);
        await fetchCustomers(); // Refresh customer list
        setShowNewCustomerModal(false);
        setNewCustomerData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          address: ''
        });
      } else {
        alert('Failed to create customer: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer. Please try again.');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'All' || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setSaleCompleted(false);
    setSelectedCustomer(null);
  };

  const handleCheckout = () => {
    setShowPaymentModal(true);
  };

  const completeSale = async () => {
    if (!user || cartItems.length === 0) return;
    
    setIsProcessingSale(true);
    
    try {
      const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      const tax = subtotal * 0.0825;
      const total = subtotal + tax;
      
      const transactionData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        })),
        customer_id: selectedCustomer?.id || null,
        cashier_id: user?.id,
        total_amount: total,
        payment_method: paymentMethod,
        payment_reference: `POS-${Date.now()}`,
        notes: `POS Sale - ${paymentMethod.toUpperCase()}${selectedCustomer ? ` - Customer: ${selectedCustomer.first_name} ${selectedCustomer.last_name}` : ' - Walk-in Customer'}`
      };
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLastTransactionNumber(result.data.transaction_number);
        setSaleCompleted(true);
        setShowPaymentModal(false);
        
        // Store invoice data if available
        if (result.data.invoice) {
          setLastInvoice(result.data.invoice);
        }
        
        // Refresh products to update stock
        const productsResponse = await fetch('/api/products');
        const productsResult = await productsResponse.json();
        if (productsResult.success && productsResult.data) {
          const updatedProducts: Product[] = productsResult.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            stock: item.stock_quantity,
            category: item.category_name || 'Uncategorized'
          }));
          setProducts(updatedProducts);
        }
      } else {
        alert('Failed to complete sale: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      alert('Failed to complete sale. Please try again.');
    } finally {
      setIsProcessingSale(false);
    }
  };

  const startNewSale = () => {
    clearCart();
    setSaleCompleted(false);
    setSelectedCustomer(null);
    setLastInvoice(null);
  };

  const viewInvoice = () => {
    if (lastInvoice) {
      setShowInvoice(true);
    }
  };

  if (isLoading || isLoadingProducts) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading POS System...</p>
        </div>
      </div>
    );
  }

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 min-h-[calc(100vh-8rem)]">
          
          {/* Products Section */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <Card className="h-full min-h-[500px] xl:min-h-full shadow-sm border-0">
              <CardContent className="p-6 h-full flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                      <p className="text-sm text-gray-500">{filteredProducts.length} items available</p>
                    </div>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg bg-white min-w-[140px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <Package className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">Try adjusting your search or filter</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
                      {filteredProducts.map((product) => (
                        <Card 
                          key={product.id}
                          className="hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 hover:border-blue-300"
                          onClick={() => addToCart(product)}
                        >
                          <CardContent className="p-4">
                            <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1 text-sm leading-tight">{product.name}</h3>
                            <p className="text-xs text-gray-500 mb-2">Stock: {product.stock}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(product);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 h-8"
                                disabled={product.stock <= 0}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <Card className="h-full min-h-[500px] xl:min-h-full shadow-sm border-0">
              <CardContent className="p-6 h-full flex flex-col">
                
                {/* Cart Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Cart</h2>
                      <p className="text-sm text-gray-500">{cartItems.length} items</p>
                    </div>
                  </div>
                  {cartItems.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Customer Selection */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-900">Customer</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewCustomerModal(true)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-100"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      New
                    </Button>
                  </div>
                  <select
                    value={selectedCustomer?.id || ''}
                    onChange={(e) => {
                      const customerId = e.target.value;
                      if (customerId) {
                        const customer = customers.find(c => c.id === customerId);
                        setSelectedCustomer(customer);
                      } else {
                        setSelectedCustomer(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Walk-in Customer (No customer info)</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name} - {customer.email}
                      </option>
                    ))}
                  </select>
                  {selectedCustomer && (
                    <div className="mt-2 p-2 bg-white rounded border text-xs text-gray-600">
                      <div>📧 {selectedCustomer.email}</div>
                      <div>📞 {selectedCustomer.phone}</div>
                      <div>📍 {selectedCustomer.address}</div>
                    </div>
                  )}
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-auto mb-6">
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-lg font-medium">Cart is empty</p>
                      <p className="text-sm text-center">Add products to start a transaction</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm flex-1 pr-2">{item.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                              <p className="font-semibold text-blue-600">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart Total and Checkout */}
                {cartItems.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (8.25%)</span>
                        <span className="font-medium">${(cartTotal * 0.0825).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span className="text-green-600">${(cartTotal * 1.0825).toFixed(2)}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={handleCheckout}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                    >
                      Complete Sale
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Method Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
                
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      paymentMethod === 'cash' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className="w-6 h-6 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">Cash</div>
                      <div className="text-sm text-gray-500">Physical cash payment</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      paymentMethod === 'card' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">Card</div>
                      <div className="text-sm text-gray-500">Credit/Debit card</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('digital')}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      paymentMethod === 'digital' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-6 h-6 text-purple-600" />
                    <div className="text-left">
                      <div className="font-medium">Digital</div>
                      <div className="text-sm text-gray-500">Mobile payment/Digital wallet</div>
                    </div>
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1"
                    disabled={isProcessingSale}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={completeSale}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isProcessingSale}
                  >
                    {isProcessingSale ? 'Processing...' : 'Complete Sale'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sale Completed Modal */}
        {saleCompleted && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-lg w-full">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sale Completed!</h2>
                <p className="text-gray-600 mb-4">
                  Transaction {lastTransactionNumber} has been processed successfully.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-600 mb-2">Total Amount</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${(cartItems.reduce((total, item) => total + (item.price * item.quantity), 0) * 1.0825).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Payment: {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                  </div>
                  {selectedCustomer && (
                    <div className="text-sm text-gray-500 mt-1">
                      Customer: {selectedCustomer.first_name} {selectedCustomer.last_name}
                    </div>
                  )}
                </div>

                {/* QR Code and Invoice Section */}
                {lastInvoice && (
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <h3 className="text-lg font-semibold mb-3">Invoice Generated</h3>
                    <div className="bg-white border rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="text-sm font-medium">Invoice #{lastInvoice.invoice_number}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(lastInvoice.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${parseFloat(lastInvoice.total_amount).toFixed(2)}</p>
                        </div>
                      </div>
                      
                      {/* QR Code Display */}
                      {lastInvoice.qr_code_data && (
                        <div className="flex flex-col items-center py-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600 mb-2">Scan QR Code for Invoice Details</p>
                          <img 
                            src={lastInvoice.qr_code_data} 
                            alt="Invoice QR Code" 
                            className="w-32 h-32 border border-gray-200 rounded"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Contains: Invoice #{lastInvoice.invoice_number}, Amount, Date
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mb-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowInvoice(true)}
                        className="flex-1 text-sm"
                      >
                        📄 View Full Invoice
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="flex-1 text-sm"
                      >
                        🖨️ Print
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  onClick={startNewSale}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Start New Sale
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Invoice Modal */}
        {showInvoice && lastInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Invoice</h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowInvoice(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>

                {/* Invoice Header */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Advanced POS Store</h3>
                      <p className="text-sm text-gray-600">123 Business Street</p>
                      <p className="text-sm text-gray-600">City, State 12345</p>
                      <p className="text-sm text-gray-600">Phone: (555) 123-4567</p>
                    </div>
                    <div className="text-right">
                      <h4 className="text-lg font-bold">INVOICE</h4>
                      <p className="text-sm"><strong>Invoice #:</strong> {lastInvoice.invoice_number}</p>
                      <p className="text-sm"><strong>Date:</strong> {new Date(lastInvoice.created_at).toLocaleDateString()}</p>
                      <p className="text-sm"><strong>Transaction:</strong> {lastTransactionNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Bill To:</h4>
                  {selectedCustomer ? (
                    <div className="text-sm">
                      <p>{selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                      {selectedCustomer.email && <p>Email: {selectedCustomer.email}</p>}
                      {selectedCustomer.phone && <p>Phone: {selectedCustomer.phone}</p>}
                      {selectedCustomer.address && <p>Address: {selectedCustomer.address}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Walk-in Customer</p>
                  )}
                </div>

                {/* Items Table */}
                <div className="mb-6">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-semibold">Item</th>
                        <th className="text-center py-2 px-3 font-semibold">Qty</th>
                        <th className="text-right py-2 px-3 font-semibold">Price</th>
                        <th className="text-right py-2 px-3 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cartItems.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2 px-3">{item.name}</td>
                          <td className="text-center py-2 px-3">{item.quantity}</td>
                          <td className="text-right py-2 px-3">${item.price.toFixed(2)}</td>
                          <td className="text-right py-2 px-3">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Tax (8.25%):</span>
                        <span>${(cartTotal * 0.0825).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>${(cartTotal * 1.0825).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Section in Full Invoice */}
                {lastInvoice.qr_code_data && (
                  <div className="border-t border-gray-200 pt-6 mt-6 text-center">
                    <h4 className="font-semibold mb-3">Payment Verification QR Code</h4>
                    <img 
                      src={lastInvoice.qr_code_data} 
                      alt="Invoice QR Code" 
                      className="w-32 h-32 mx-auto border border-gray-200 rounded"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Scan to verify invoice details and payment
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-gray-200 pt-6 mt-6 text-center text-sm text-gray-600">
                  <p>Thank you for your business!</p>
                  <p>Payment Method: {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="flex-1"
                  >
                    🖨️ Print Invoice
                  </Button>
                  <Button
                    onClick={() => setShowInvoice(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Customer Modal */}
        {showNewCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createNewCustomer();
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={newCustomerData.first_name}
                      onChange={(e) => setNewCustomerData({...newCustomerData, first_name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={newCustomerData.last_name}
                      onChange={(e) => setNewCustomerData({...newCustomerData, last_name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newCustomerData.email}
                    onChange={(e) => setNewCustomerData({...newCustomerData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newCustomerData.phone}
                    onChange={(e) => setNewCustomerData({...newCustomerData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <textarea
                    placeholder="Address"
                    value={newCustomerData.address}
                    onChange={(e) => setNewCustomerData({...newCustomerData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    required
                  />
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowNewCustomerModal(false);
                        setNewCustomerData({
                          first_name: '',
                          last_name: '',
                          email: '',
                          phone: '',
                          address: ''
                        });
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Add Customer
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {showInvoice && lastInvoice && (
        <Invoice
          invoice={lastInvoice}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
} 