'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductDataTable } from "@/components/products/product-data-table";
import { columns } from "@/components/products/columns";
import { ProductDialog } from "@/components/products/product-dialog";
import { useState, useEffect } from "react";
import { Product } from "@/components/products/columns";
import { Package, Warehouse, Plus, ArrowUpDown, BarChart3, TrendingUp, DollarSign } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (data: any) => {
    try {
      setLoading(true);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to create product');
      }

      const newProduct = await response.json();
    setProducts([...products, newProduct]);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (data: any) => {
    if (!editingProduct) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingProduct.id,
          ...data
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const updatedProduct = await response.json();
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setIsDialogOpen(false);
    setEditingProduct(undefined);
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/products?id=${product.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(products.filter(p => p.id !== product.id));
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };
  
  // Calculate metrics for overview cards
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
  const totalValue = products.reduce((sum, product) => sum + ((product.price || 0) * (product.stock || 0)), 0);
  const lowStockProducts = products.filter(p => (p.stock || 0) <= 10).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Product Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your product catalog and inventory
        </p>
      </div>
      
      {/* Show error message if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-4">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{totalProducts}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mr-4">
                <Warehouse className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total In Stock</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{totalStock} units</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-4">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inventory Value</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">${totalValue.toFixed(2)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Items</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{lowStockProducts}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Products Table */}
      <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800">
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">Products</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
                {products.length} products in your catalog
              </CardDescription>
            </div>
            <div className="flex items-center">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 ml-auto"
                onClick={() => {
                  setEditingProduct(undefined); // Ensure we're in add mode
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && !products.length ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
          <ProductDataTable 
            columns={columns({ 
              onEdit: handleEditClick,
              onDelete: handleDeleteProduct
            })} 
            data={products} 
          />
          )}
        </CardContent>
      </Card>

      <ProductDialog
        mode={editingProduct ? 'edit' : 'add'}
        initialData={editingProduct}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
} 