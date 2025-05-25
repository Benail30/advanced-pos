import { pgTable, text, timestamp, uuid, decimal, jsonb } from 'drizzle-orm/pg-core';
import { transactions } from './transaction';

export const paymentTypes = pgTable('payment_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  isActive: text('is_active').notNull().default('true'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').references(() => transactions.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method: text('method', { enum: ['cash', 'card', 'e_wallet'] }).notNull(),
  status: text('status', { enum: ['pending', 'completed', 'failed'] }).notNull().default('pending'),
  changeAmount: decimal('change_amount', { precision: 10, scale: 2 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type PaymentType = typeof paymentTypes.$inferSelect;
export type NewPaymentType = typeof paymentTypes.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert; 