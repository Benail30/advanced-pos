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
import { useState } from "react";
import { Product } from "@/components/products/columns";
import { Package, Warehouse, Plus, ArrowUpDown, BarChart3 } from "lucide-react";

// Sample data - replace with actual data from your database
const sampleData: Product[] = [
  {
    id: '1',
    name: 'T-Shirt',
    sku: 'TS-001',
    price: 19.99,
    category: 'clothing',
    stock: 25,
    status: 'active',
  },
  {
    id: '2',
    name: 'Coffee Mug',
    sku: 'MG-001',
    price: 9.99,
    category: 'accessories',
    stock: 30,
    status: 'active',
  },
  {
    id: '3',
    name: 'Baseball Cap',
    sku: 'CAP-001',
    price: 14.99,
    category: 'accessories',
    stock: 15,
    status: 'active',
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(sampleData);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddProduct = (data: any) => {
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
    };
    setProducts([...products, newProduct]);
  };

  const handleEditProduct = (data: any) => {
    setProducts(
      products.map((product) =>
        product.id === editingProduct?.id
          ? {
              ...product,
              ...data,
              price: parseFloat(data.price),
              stock: parseInt(data.stock),
            }
          : product
      )
    );
    setIsEditDialogOpen(false);
    setEditingProduct(undefined);
  };

  const handleDeleteProduct = (product: Product) => {
    setProducts(products.filter((p) => p.id !== product.id));
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };
  
  // Calculate metrics for overview cards
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600-alt bg-clip-text text-transparent">
          Product Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your product catalog and inventory
        </p>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-lg transition-shadow">
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
        
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-lg transition-shadow">
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
        
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-4">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inventory Value</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">${totalValue.toFixed(2)}</h3>
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
                className="bg-gradient-to-r from-blue-600 to-purple-600-alt hover:opacity-90 ml-auto"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ProductDataTable 
            columns={columns({ 
              onEdit: handleEditClick,
              onDelete: handleDeleteProduct
            })} 
            data={products} 
          />
        </CardContent>
      </Card>

      <ProductDialog
        mode="edit"
        initialData={editingProduct}
        onSubmit={handleEditProduct}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
} 