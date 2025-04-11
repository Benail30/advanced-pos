import { pgTable, uuid, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { stockTransfers } from './stockTransfers';
import { products } from './products';

export const stockTransferItems = pgTable('stock_transfer_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  transferId: uuid('transfer_id').references(() => stockTransfers.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
});

// Define Zod schemas for validation
export const insertStockTransferItemSchema = createInsertSchema(stockTransferItems, {
  transferId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const updateStockTransferItemSchema = createSelectSchema(stockTransferItems, {
  id: z.string().uuid(),
}).merge(insertStockTransferItemSchema.partial());

export const selectStockTransferItemSchema = createSelectSchema(stockTransferItems);

// Custom types
export type StockTransferItem = z.infer<typeof selectStockTransferItemSchema>;
export type NewStockTransferItem = z.infer<typeof insertStockTransferItemSchema>;
export type UpdateStockTransferItem = z.infer<typeof updateStockTransferItemSchema>;

// Helper functions
export const validateTransferQuantity = (quantity: number, availableStock: number) => {
  return quantity > 0 && quantity <= availableStock;
};

export const calculateTransferTotal = (items: StockTransferItem[]) => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

export const groupByProduct = (items: StockTransferItem[]) => {
  return items.reduce((groups, item) => {
    const group = groups[item.productId] || [];
    group.push(item);
    groups[item.productId] = group;
    return groups;
  }, {} as Record<string, StockTransferItem[]>);
}; 