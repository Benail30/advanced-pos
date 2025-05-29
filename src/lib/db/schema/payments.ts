import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { orders } from './orders';

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export const payments = pgTable('payments', {
  id: varchar('id').primaryKey().$defaultFn(() => createId()),
  orderId: varchar('order_id').notNull().references(() => orders.id),
  amount: text('amount').notNull(),
  method: varchar('method', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  paymentDate: timestamp('payment_date').notNull().defaultNow(),
  metadata: text('metadata')
});

// Define types
export type Payment = {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paymentDate: Date;
};

export type NewPayment = Omit<Payment, 'id' | 'paymentDate'>;
export type UpdatePayment = Partial<NewPayment> & { id: string }; 