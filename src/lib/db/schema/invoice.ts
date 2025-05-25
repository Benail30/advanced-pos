import { pgTable, uuid, timestamp, text, jsonb } from 'drizzle-orm/pg-core';
import { transactions } from './transactions';

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').references(() => transactions.id).notNull(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  qrCode: text('qr_code'),
  pdfUrl: text('pdf_url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert; 