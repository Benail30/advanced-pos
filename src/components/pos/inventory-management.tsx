'use client';

import { useState } from 'react';
import { Package, AlertTriangle, Search, Filter, Plus, Edit2, Trash2, ArrowUpDown } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  location: string;
  lastUpdated: string;
}

interface InventoryManagementProps {
  products: Product[];
  onUpdateStock: (productId: string, newQuantity: number) => void;
  onUpdateMinStock: (productId: string, newMinStock: number) => void;
  onUpdateLocation: (productId: string, newLocation: string) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export function InventoryManagement({
  products,
  onUpdateStock,
  onUpdateMinStock,
  onUpdateLocation,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}: InventoryManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const categories = Array.from(new Set(products.map(p => p.category)));

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction * aValue.localeCompare(bValue);
    }
    return direction * (Number(aValue) - Number(bValue));
  });

  const filteredProducts = sortedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesLowStock = !showLowStock || product.currentStock <= product.minStockLevel;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Items</p>
          <p className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">{lowStockProducts.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</p>
          <p className="text-2xl font-bold text-red-500 dark:text-red-400">
            {products.filter(p => p.currentStock === 0).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
        </div>
      </div>

      {/* Add Product Button */}
      <div className="flex justify-end mb-4">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
          onClick={() => onAddProduct({
            sku: 'NEW-001',
            name: 'New Product',
            category: 'uncategorized',
            currentStock: 0,
            minStockLevel: 0,
            location: '',
          })}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                showLowStock 
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Low Stock
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Product
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('currentStock')}
                >
                  <div className="flex items-center">
                    Current Stock
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('minStockLevel')}
                >
                  <div className="flex items-center">
                    Min Stock
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center">
                    Location
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastUpdated')}
                >
                  <div className="flex items-center">
                    Last Updated
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map(product => (
                <tr 
                  key={product.id} 
                  className={`${
                    product.currentStock <= product.minStockLevel 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-3">
                        <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={product.currentStock}
                      onChange={(e) => onUpdateStock(product.id, Number(e.target.value))}
                      className="w-20 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={product.minStockLevel}
                      onChange={(e) => onUpdateMinStock(product.id, Number(e.target.value))}
                      className="w-20 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={product.location}
                      onChange={(e) => onUpdateLocation(product.id, e.target.value)}
                      className="w-32 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(product.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300">Low Stock Alerts</h3>
          </div>
          <div className="space-y-2">
            {lowStockProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md border border-yellow-200 dark:border-yellow-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current: {product.currentStock} | Minimum: {product.minStockLevel}
                  </p>
                </div>
                <button
                  onClick={() => onUpdateStock(product.id, product.minStockLevel + 10)}
                  className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900/70 transition-colors"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 