import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { orders } from './orders';

export const invoices = pgTable('invoices', {
  id: varchar('id').primaryKey().$defaultFn(() => createId()),
  orderId: varchar('order_id').notNull().references(() => orders.id),
  totalAmount: text('total_amount').notNull(),
  qrCodeData: text('qr_code_data').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Define types
export type Invoice = {
  id: string;
  orderId: string;
  totalAmount: number;
  qrCodeData: string;
  createdAt: Date;
};

export type NewInvoice = Omit<Invoice, 'id' | 'createdAt'>;
export type UpdateInvoice = Partial<NewInvoice> & { id: string }; 