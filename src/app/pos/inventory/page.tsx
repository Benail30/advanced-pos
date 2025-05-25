'use client';

import { useState, useEffect } from 'react';
import { InventoryManagement } from '@/components/pos/inventory-management';
import { AlertTriangle, X, Check } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0/client';

// Sample data - replace with actual data from your backend
const sampleProducts = [
  {
    id: '1',
    sku: 'TS-001',
    name: 'T-Shirt',
    category: 'clothing',
    currentStock: 25,
    minStockLevel: 10,
    location: 'A1',
    lastUpdated: new Date(2023, 4, 10).toISOString()
  },
  {
    id: '2',
    sku: 'MG-001',
    name: 'Coffee Mug',
    category: 'accessories',
    currentStock: 30,
    minStockLevel: 15,
    location: 'B2',
    lastUpdated: new Date(2023, 4, 12).toISOString()
  },
  {
    id: '3',
    sku: 'CAP-001',
    name: 'Baseball Cap',
    category: 'accessories',
    currentStock: 15,
    minStockLevel: 10,
    location: 'B3',
    lastUpdated: new Date(2023, 4, 14).toISOString()
  },
  {
    id: '4',
    sku: 'NB-001',
    name: 'Notebook',
    category: 'stationery',
    currentStock: 40,
    minStockLevel: 20,
    location: 'C1',
    lastUpdated: new Date(2023, 4, 15).toISOString()
  },
  {
    id: '5',
    sku: 'WB-001',
    name: 'Water Bottle',
    category: 'accessories',
    currentStock: 20,
    minStockLevel: 15,
    location: 'B4',
    lastUpdated: new Date(2023, 4, 16).toISOString()
  },
  {
    id: '6',
    sku: 'BP-001',
    name: 'Backpack',
    category: 'accessories',
    currentStock: 10,
    minStockLevel: 5,
    location: 'D1',
    lastUpdated: new Date(2023, 4, 14).toISOString()
  },
  {
    id: '7',
    sku: 'HD-001',
    name: 'Hoodie',
    category: 'clothing',
    currentStock: 18,
    minStockLevel: 12,
    location: 'A2',
    lastUpdated: new Date(2023, 4, 13).toISOString()
  },
  {
    id: '8',
    sku: 'PC-001',
    name: 'Phone Case',
    category: 'electronics',
    currentStock: 22,
    minStockLevel: 10,
    location: 'E1',
    lastUpdated: new Date(2023, 4, 11).toISOString()
  }
];

export default function InventoryPage() {
  const { user, error: userError, isLoading: userLoading } = useUser();
  const [products, setProducts] = useState(sampleProducts);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Simulate loading products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        // const response = await fetch('/api/products');
        // const data = await response.json();
        // setProducts(data);
        
        // For demo purposes, simulate API delay
        setTimeout(() => {
          setProducts(sampleProducts);
          setIsLoading(false);
        }, 500);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again.');
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadProducts();
    }
  }, [user]);
  
  const handleUpdateStock = (productId: string, newQuantity: number) => {
    setProducts(products.map(product => 
      product.id === productId
        ? { 
            ...product, 
            currentStock: newQuantity,
            lastUpdated: new Date().toISOString()
          }
        : product
    ));
    
    showNotification('Stock updated successfully', 'success');
  };
  
  const handleUpdateMinStock = (productId: string, newMinStock: number) => {
    setProducts(products.map(product => 
      product.id === productId
        ? { ...product, minStockLevel: newMinStock }
        : product
    ));
    
    showNotification('Minimum stock level updated', 'success');
  };
  
  const handleUpdateLocation = (productId: string, newLocation: string) => {
    setProducts(products.map(product => 
      product.id === productId
        ? { ...product, location: newLocation }
        : product
    ));
    
    showNotification('Location updated', 'success');
  };
  
  const handleAddProduct = (product: Omit<typeof products[0], 'id' | 'lastUpdated'>) => {
    const newProduct = {
      ...product,
      id: `${Date.now().toString(36)}`,
      lastUpdated: new Date().toISOString()
    };
    
    setProducts([...products, newProduct]);
    showNotification('Product added successfully', 'success');
  };
  
  const handleEditProduct = (updatedProduct: typeof products[0]) => {
    setProducts(products.map(product => 
      product.id === updatedProduct.id
        ? { ...updatedProduct, lastUpdated: new Date().toISOString() }
        : product
    ));
    
    showNotification('Product updated successfully', 'success');
  };
  
  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(product => product.id !== productId));
    showNotification('Product deleted', 'success');
  };
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (userLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <p>Authentication error. Please try logging in again.</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <p>Please log in to view the inventory management.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="ml-auto bg-red-800 text-white px-3 py-1 rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>
      
      {notification && (
        <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            <p>{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <InventoryManagement
        products={products}
        onUpdateStock={handleUpdateStock}
        onUpdateMinStock={handleUpdateMinStock}
        onUpdateLocation={handleUpdateLocation}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
} 