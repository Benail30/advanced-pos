import { pgTable, uuid, varchar, timestamp, text, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const suppliers = pgTable('suppliers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  contactPerson: varchar('contact_person', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  taxId: varchar('tax_id', { length: 50 }),
  notes: text('notes'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define Zod schemas for validation
export const insertSupplierSchema = createInsertSchema(suppliers, {
  name: z.string().min(1).max(100),
  contactPerson: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  taxId: z.string().max(50).optional(),
  notes: z.string().optional(),
  active: z.boolean().default(true),
});

export const updateSupplierSchema = createSelectSchema(suppliers, {
  id: z.string().uuid(),
}).merge(insertSupplierSchema.partial());

export const selectSupplierSchema = createSelectSchema(suppliers);

// Custom types
export type Supplier = z.infer<typeof selectSupplierSchema>;
export type NewSupplier = z.infer<typeof insertSupplierSchema>;
export type UpdateSupplier = z.infer<typeof updateSupplierSchema>;

// Helper functions
export const getSupplierContactInfo = (supplier: Supplier) => {
  const contact: string[] = [];
  if (supplier.contactPerson) contact.push(`Contact: ${supplier.contactPerson}`);
  if (supplier.phone) contact.push(`Tel: ${supplier.phone}`);
  if (supplier.email) contact.push(`Email: ${supplier.email}`);
  return contact.join(' | ');
};

export const formatSupplierAddress = (supplier: Supplier) => {
  return supplier.address?.replace(/\n/g, ', ') || '';
};

export const getSupplierStatus = (supplier: Supplier) => {
  return supplier.active ? 'Active' : 'Inactive';
};

export const validateTaxId = (taxId: string) => {
  // This is a basic validation - should be customized based on your country's tax ID format
  return /^[A-Z0-9-]+$/.test(taxId);
}; 