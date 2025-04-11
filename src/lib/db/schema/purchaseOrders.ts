import { pgTable, uuid, varchar, timestamp, text, decimal, date } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { stores } from './stores';
import { suppliers } from './suppliers';
import { users } from './users';

// Define valid purchase order statuses
const VALID_PO_STATUSES = ['draft', 'pending', 'received', 'canceled'] as const;

export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  poNumber: varchar('po_number', { length: 50 }).notNull().unique(),
  storeId: uuid('store_id').references(() => stores.id),
  supplierId: uuid('supplier_id').references(() => suppliers.id),
  status: varchar('status', { length: 50 }).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  expectedDeliveryDate: date('expected_delivery_date'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define Zod schemas for validation
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders, {
  poNumber: z.string().min(1).max(50),
  storeId: z.string().uuid(),
  supplierId: z.string().uuid(),
  status: z.enum(VALID_PO_STATUSES),
  subtotal: z.coerce.number().nonnegative(),
  taxAmount: z.coerce.number().nonnegative(),
  totalAmount: z.coerce.number().positive(),
  notes: z.string().optional(),
  expectedDeliveryDate: z.date().optional(),
  createdBy: z.string().uuid(),
});

export const updatePurchaseOrderSchema = createSelectSchema(purchaseOrders, {
  id: z.string().uuid(),
}).merge(insertPurchaseOrderSchema.partial());

export const selectPurchaseOrderSchema = createSelectSchema(purchaseOrders);

// Custom types
export type PurchaseOrder = z.infer<typeof selectPurchaseOrderSchema>;
export type NewPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type UpdatePurchaseOrder = z.infer<typeof updatePurchaseOrderSchema>;

// Helper functions
export const isPurchaseOrderComplete = (po: PurchaseOrder) => {
  return po.status === 'received';
};

export const canCancelPurchaseOrder = (po: PurchaseOrder) => {
  return po.status === 'draft' || po.status === 'pending';
};

export const generatePONumber = (prefix: string = 'PO') => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const calculatePOTotals = (subtotal: number, taxRate: number) => {
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;
  return { taxAmount, totalAmount };
};

export const calculateTotals = (subtotal: number, taxAmount: number) => {
  return {
    subtotal,
    taxAmount,
    totalAmount: subtotal + taxAmount,
  };
};

export const isEditable = (order: PurchaseOrder) => {
  return order.status === 'draft' || order.status === 'pending';
};

export const isCancelable = (order: PurchaseOrder) => {
  return order.status === 'draft' || order.status === 'pending';
};

export const canReceive = (order: PurchaseOrder) => {
  return order.status === 'pending';
};

export const getStatusColor = (status: PurchaseOrderStatus) => {
  switch (status) {
    case 'draft':
      return 'gray';
    case 'pending':
      return 'yellow';
    case 'received':
      return 'green';
    case 'canceled':
      return 'red';
    default:
      return 'gray';
  }
};

export const formatAmount = (amount: number | string) => {
  return `$${Number(amount).toFixed(2)}`;
}; 