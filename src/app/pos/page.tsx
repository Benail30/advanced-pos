'use client';

import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

// Sample product data
const sampleProducts: Product[] = [
  { id: 1, name: 'T-Shirt', price: 19.99, category: 'Clothing' },
  { id: 2, name: 'Coffee Mug', price: 9.99, category: 'Accessories' },
  { id: 3, name: 'Baseball Cap', price: 14.99, category: 'Accessories' },
  { id: 4, name: 'Notebook', price: 4.99, category: 'Stationery' },
  { id: 5, name: 'Water Bottle', price: 12.99, category: 'Accessories' },
  { id: 6, name: 'Headphones', price: 89.99, category: 'Electronics' },
];

export default function POSPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filter products based on search term
  const filteredProducts = sampleProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Add product to cart
  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // If product already in cart, increase quantity
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Add new product to cart
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };
  
  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };
  
  // Update item quantity
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };
  
  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 border rounded-lg p-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(product)}
              >
                <div className="h-12 w-12 bg-gray-200 rounded-full mb-2 flex items-center justify-center text-gray-500">
                  {product.name.charAt(0)}
                </div>
                <h3 className="font-medium">{product.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">{product.category}</span>
                  <span className="font-bold">${product.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Cart Section */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Cart is empty. Add products to get started.
            </div>
          ) : (
            <>
              <div className="divide-y mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="py-3">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </div>
                      <div className="flex items-center">
                        <button 
                          className="w-8 h-8 rounded-full border flex items-center justify-center"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >-</button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button 
                          className="w-8 h-8 rounded-full border flex items-center justify-center"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >+</button>
                        <button 
                          className="ml-2 text-red-500"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                
                <button 
                  className="w-full mt-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  onClick={() => {
                    alert(`Order placed! Total: $${cartTotal.toFixed(2)}`);
                    setCartItems([]);
                  }}
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 