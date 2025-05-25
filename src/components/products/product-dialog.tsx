'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateSKU } from '@/lib/utils';

// Common product categories
const commonCategories = [
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Books & Stationery',
  'Toys & Games',
  'Automotive',
  'Health & Wellness',
  'Office Supplies',
  'Pet Supplies',
  'Jewelry & Accessories',
  'Furniture',
  'Tools & Hardware',
];

interface ProductDialogProps {
  mode: 'add' | 'edit';
  initialData?: any;
  onSubmit: (data: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDialog({ 
  mode, 
  initialData, 
  onSubmit, 
  open,
  onOpenChange,
}: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price || '',
    category: initialData?.category || '',
    stock: initialData?.stock || '',
    status: initialData?.status || 'active',
    description: initialData?.description || '',
    unit: initialData?.unit || 'piece',
    minStock: initialData?.minStock || 0,
    maxStock: initialData?.maxStock || '',
  });
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price || '',
        category: initialData.category || '',
        stock: initialData.stock || '',
        status: initialData.status || 'active',
        description: initialData.description || '',
        unit: initialData.unit || 'piece',
        minStock: initialData.minStock || 0,
        maxStock: initialData.maxStock || '',
      });
    } else {
      // Reset form when adding a new product
      setFormData({
        name: '',
        price: '',
        category: '',
        stock: '',
        status: 'active',
        description: '',
        unit: 'piece',
        minStock: 0,
        maxStock: '',
      });
    }
    setCustomCategory('');
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = customCategory || formData.category;
    // Generate SKU if needed
    let sku = initialData?.sku;
    if (!sku && mode === 'add') {
      sku = generateSKU(finalCategory);
    }
    onSubmit({
      ...formData,
      category: finalCategory,
      sku,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      maxStock: formData.maxStock ? parseInt(formData.maxStock) : null,
    });
  };

  const handleCategorySelect = (value: string) => {
    setFormData({ ...formData, category: value });
    setCustomCategory(''); // Clear custom category when selecting from dropdown
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-800 border-0 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="flex flex-col space-y-2">
              <Select
                value={formData.category}
                onValueChange={handleCategorySelect}
              >
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {commonCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-500 text-center">or</div>
              <Input
                id="customCategory"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Type a custom category"
                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="g">Gram</SelectItem>
                  <SelectItem value="l">Liter</SelectItem>
                  <SelectItem value="ml">Milliliter</SelectItem>
                  <SelectItem value="m">Meter</SelectItem>
                  <SelectItem value="cm">Centimeter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Current Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Min Stock</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStock">Max Stock</Label>
              <Input
                id="maxStock"
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
            >
              {mode === 'add' ? 'Add Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 