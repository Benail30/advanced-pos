import { pgTable, uuid, integer, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { purchaseOrders } from './purchaseOrders';
import { products } from './products';

export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  purchaseOrderId: uuid('purchase_order_id').references(() => purchaseOrders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitCost: decimal('unit_cost', { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
});

// Define Zod schemas for validation
export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems, {
  purchaseOrderId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitCost: z.coerce.number().positive(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  subtotal: z.coerce.number().nonnegative(),
});

export const updatePurchaseOrderItemSchema = createSelectSchema(purchaseOrderItems, {
  id: z.string().uuid(),
}).merge(insertPurchaseOrderItemSchema.partial());

export const selectPurchaseOrderItemSchema = createSelectSchema(purchaseOrderItems);

// Custom types
export type PurchaseOrderItem = z.infer<typeof selectPurchaseOrderItemSchema>;
export type NewPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type UpdatePurchaseOrderItem = z.infer<typeof updatePurchaseOrderItemSchema>;

// Helper functions
export const calculateItemSubtotal = (quantity: number, unitCost: number) => {
  return quantity * unitCost;
};

export const calculateItemTaxAmount = (subtotal: number, taxRate: number) => {
  return (subtotal * taxRate) / 100;
};

export const calculateItemTotal = (subtotal: number, taxAmount: number) => {
  return subtotal + taxAmount;
};

export const calculatePOItemMetrics = (
  quantity: number,
  unitCost: number,
  taxRate: number
) => {
  const subtotal = calculateItemSubtotal(quantity, unitCost);
  const taxAmount = calculateItemTaxAmount(subtotal, taxRate);
  const total = calculateItemTotal(subtotal, taxAmount);

  return {
    subtotal,
    taxAmount,
    total,
  };
};

export const formatQuantity = (quantity: number | string) => {
  return Number(quantity).toFixed(2);
};

export const formatUnitPrice = (price: number | string) => {
  return `$${Number(price).toFixed(2)}`;
};

export const formatTaxRate = (rate: number | string) => {
  return `${Number(rate).toFixed(2)}%`;
};

export const formatAmount = (amount: number | string) => {
  return `$${Number(amount).toFixed(2)}`;
}; 