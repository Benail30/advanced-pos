'use client';

import { useState } from 'react';
import { Package, AlertTriangle, Search, Filter, Plus, Edit2, Trash2 } from 'lucide-react';

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

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(product => {
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
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">Low Stock Items</p>
          <p className="text-2xl font-bold text-yellow-500">{lowStockProducts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-2xl font-bold text-red-500">
            {products.filter(p => p.currentStock === 0).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-bold">{categories.length}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                showLowStock ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Low Stock
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.id} className={product.currentStock <= product.minStockLevel ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={product.currentStock}
                      onChange={(e) => onUpdateStock(product.id, Number(e.target.value))}
                      className="w-20 p-1 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={product.minStockLevel}
                      onChange={(e) => onUpdateMinStock(product.id, Number(e.target.value))}
                      className="w-20 p-1 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={product.location}
                      onChange={(e) => onUpdateLocation(product.id, e.target.value)}
                      className="w-32 p-1 border border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(product.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-medium text-yellow-800">Low Stock Alerts</h3>
          </div>
          <div className="space-y-2">
            {lowStockProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded-md">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    Current: {product.currentStock} | Minimum: {product.minStockLevel}
                  </p>
                </div>
                <button
                  onClick={() => onUpdateStock(product.id, product.minStockLevel + 10)}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
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