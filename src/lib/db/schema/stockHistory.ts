import { pgTable, uuid, varchar, timestamp, text, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { stores } from './stores';
import { products } from './products';
import { users } from './users';

// Define valid stock change types
const VALID_STOCK_CHANGE_TYPES = ['purchase', 'sale', 'return', 'adjustment', 'transfer'] as const;

export const stockHistory = pgTable('stock_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').references(() => stores.id),
  productId: uuid('product_id').references(() => products.id),
  quantityChange: integer('quantity_change').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  referenceId: uuid('reference_id'),
  notes: text('notes'),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Define Zod schemas for validation
export const insertStockHistorySchema = createInsertSchema(stockHistory, {
  storeId: z.string().uuid(),
  productId: z.string().uuid(),
  quantityChange: z.number().int(),
  type: z.enum(VALID_STOCK_CHANGE_TYPES),
  referenceId: z.string().uuid().optional(),
  notes: z.string().optional(),
  userId: z.string().uuid(),
});

export const updateStockHistorySchema = createSelectSchema(stockHistory, {
  id: z.string().uuid(),
}).merge(insertStockHistorySchema.partial());

export const selectStockHistorySchema = createSelectSchema(stockHistory);

// Custom types
export type StockHistory = z.infer<typeof selectStockHistorySchema>;
export type NewStockHistory = z.infer<typeof insertStockHistorySchema>;
export type UpdateStockHistory = z.infer<typeof updateStockHistorySchema>;

// Helper functions
export const isStockIncrease = (history: StockHistory) => {
  return history.quantityChange > 0;
};

export const isStockDecrease = (history: StockHistory) => {
  return history.quantityChange < 0;
};

export const getStockChangeDescription = (history: StockHistory) => {
  const action = isStockIncrease(history) ? 'increased' : 'decreased';
  return `Stock ${action} by ${Math.abs(history.quantityChange)} units`;
}; 