import { pgTable, uuid, varchar, timestamp, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { transactions } from './transactions';

// Define valid payment methods and statuses
const VALID_PAYMENT_METHODS = ['cash', 'credit_card', 'debit_card', 'e_wallet', 'bank_transfer'] as const;
const VALID_STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const;

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').references(() => transactions.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  paymentReference: varchar('payment_reference', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Define Zod schemas for validation
export const insertPaymentSchema = createInsertSchema(payments, {
  transactionId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  paymentMethod: z.enum(VALID_PAYMENT_METHODS),
  paymentReference: z.string().max(100).optional(),
  status: z.enum(VALID_STATUSES),
});

export const updatePaymentSchema = createSelectSchema(payments, {
  id: z.string().uuid(),
}).merge(insertPaymentSchema.partial());

export const selectPaymentSchema = createSelectSchema(payments);

// Custom types
export type Payment = z.infer<typeof selectPaymentSchema>;
export type NewPayment = z.infer<typeof insertPaymentSchema>;
export type UpdatePayment = z.infer<typeof updatePaymentSchema>;

// Helper functions
export const isPaymentSuccessful = (payment: Payment) => {
  return payment.status === 'completed';
};

export const canRefundPayment = (payment: Payment) => {
  return payment.status === 'completed';
}; 