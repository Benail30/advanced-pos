import { pgTable, uuid, integer, decimal, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { transactions } from './transactions';
import { products } from './products';

export const transactionItems = pgTable('transaction_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define Zod schemas for validation
export const insertTransactionItemSchema = createInsertSchema(transactionItems, {
  transactionId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.coerce.number().positive(),
  taxRate: z.coerce.number().min(0).max(100),
  taxAmount: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).default(0),
  subtotal: z.coerce.number().min(0),
  total: z.coerce.number().min(0),
});

export const updateTransactionItemSchema = createSelectSchema(transactionItems, {
  id: z.string().uuid(),
}).merge(insertTransactionItemSchema.partial());

export const selectTransactionItemSchema = createSelectSchema(transactionItems);

// Custom types
export type TransactionItem = z.infer<typeof selectTransactionItemSchema>;
export type NewTransactionItem = z.infer<typeof insertTransactionItemSchema>;
export type UpdateTransactionItem = z.infer<typeof updateTransactionItemSchema>;

// Helper functions
export const calculateSubtotal = (quantity: number, unitPrice: number) => {
  return quantity * unitPrice;
};

export const calculateTaxAmount = (subtotal: number, taxRate: number) => {
  return (subtotal * taxRate) / 100;
};

export const calculateTotal = (subtotal: number, taxAmount: number, discountAmount: number) => {
  return subtotal + taxAmount - discountAmount;
};

export const calculateItemMetrics = (
  quantity: number,
  unitPrice: number,
  taxRate: number,
  discountAmount = 0
) => {
  const subtotal = calculateSubtotal(quantity, unitPrice);
  const taxAmount = calculateTaxAmount(subtotal, taxRate);
  const total = calculateTotal(subtotal, taxAmount, discountAmount);

  return {
    subtotal,
    taxAmount,
    total,
  };
}; 