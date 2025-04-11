import { pgTable, uuid, varchar, boolean, timestamp, text, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { stores } from './stores';
import { users } from './users';
import { customers } from './customers';

// Define valid payment methods and statuses
const VALID_PAYMENT_METHODS = ['cash', 'credit_card', 'debit_card', 'e_wallet', 'bank_transfer'];
const VALID_STATUSES = ['pending', 'completed', 'refunded', 'voided'];

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionNumber: varchar('transaction_number', { length: 50 }).notNull().unique(),
  storeId: uuid('store_id').references(() => stores.id),
  userId: uuid('user_id').references(() => users.id),
  customerId: uuid('customer_id').references(() => customers.id),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  paymentReference: varchar('payment_reference', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define Zod schemas for validation
export const insertTransactionSchema = createInsertSchema(transactions, {
  transactionNumber: z.string().min(1),
  subtotal: z.coerce.number().nonnegative(),
  taxAmount: z.coerce.number().nonnegative(),
  discountAmount: z.coerce.number().nonnegative().default(0),
  totalAmount: z.coerce.number().positive(),
  paymentMethod: z.enum(VALID_PAYMENT_METHODS as [string, ...string[]]),
  status: z.enum(VALID_STATUSES as [string, ...string[]]),
});

export const selectTransactionSchema = createSelectSchema(transactions);

export type Transaction = z.infer<typeof selectTransactionSchema>;
export type NewTransaction = z.infer<typeof insertTransactionSchema>; 