'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProductForm } from './product-form';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Product } from './columns';

interface ProductDialogProps {
  mode: 'add' | 'edit';
  initialData?: Product;
  onSubmit: (data: any) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProductDialog({ 
  mode, 
  initialData, 
  onSubmit, 
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: ProductDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const open = controlledOpen ?? uncontrolledOpen;
  const onOpenChange = controlledOnOpenChange ?? setUncontrolledOpen;

  const handleSubmit = (data: any) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {mode === 'add' ? 'Add Product' : 'Edit Product'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Add a new product to your inventory.'
              : 'Make changes to your product here.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ProductForm 
            initialData={initialData ? {
              ...initialData,
              price: initialData.price.toString(),
              stock: initialData.stock.toString(),
            } : undefined} 
            onSubmit={handleSubmit} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 