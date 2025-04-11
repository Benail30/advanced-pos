import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { stores } from './stores';
import { users } from './users';

// Define valid transfer statuses
const VALID_TRANSFER_STATUSES = ['draft', 'pending', 'completed', 'canceled'] as const;

export const stockTransfers = pgTable('stock_transfers', {
  id: uuid('id').defaultRandom().primaryKey(),
  referenceNumber: varchar('reference_number', { length: 50 }).notNull().unique(),
  sourceStoreId: uuid('source_store_id').references(() => stores.id),
  destinationStoreId: uuid('destination_store_id').references(() => stores.id),
  status: varchar('status', { length: 50 }).notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define Zod schemas for validation
export const insertStockTransferSchema = createInsertSchema(stockTransfers, {
  referenceNumber: z.string().min(1).max(50),
  sourceStoreId: z.string().uuid(),
  destinationStoreId: z.string().uuid(),
  status: z.enum(VALID_TRANSFER_STATUSES),
  notes: z.string().optional(),
  createdBy: z.string().uuid(),
});

export const updateStockTransferSchema = createSelectSchema(stockTransfers, {
  id: z.string().uuid(),
}).merge(insertStockTransferSchema.partial());

export const selectStockTransferSchema = createSelectSchema(stockTransfers);

// Custom types
export type StockTransfer = z.infer<typeof selectStockTransferSchema>;
export type NewStockTransfer = z.infer<typeof insertStockTransferSchema>;
export type UpdateStockTransfer = z.infer<typeof updateStockTransferSchema>;

// Helper functions
export const isTransferComplete = (transfer: StockTransfer) => {
  return transfer.status === 'completed';
};

export const canCancelTransfer = (transfer: StockTransfer) => {
  return transfer.status === 'draft' || transfer.status === 'pending';
};

export const generateTransferReference = (prefix: string = 'TRF') => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}; 