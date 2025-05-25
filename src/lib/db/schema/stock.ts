import { pgTable, uuid, timestamp, integer, text, jsonb } from 'drizzle-orm/pg-core';
import { products } from './products';
import { transactions } from './transactions';
import { users } from './users';

export const stockHistory = pgTable('stock_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  previousQuantity: integer('previous_quantity').notNull(),
  newQuantity: integer('new_quantity').notNull(),
  changeQuantity: integer('change_quantity').notNull(),
  transactionId: uuid('transaction_id').references(() => transactions.id),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: text('type', { enum: ['sale', 'adjustment', 'restock'] }).notNull(),
  notes: text('notes'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type StockHistory = typeof stockHistory.$inferSelect;
export type NewStockHistory = typeof stockHistory.$inferInsert; 