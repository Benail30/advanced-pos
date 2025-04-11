import { pgTable, uuid, varchar, boolean, timestamp, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const stores = pgTable('stores', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  taxId: varchar('tax_id', { length: 50 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define Zod schemas for validation
export const insertStoreSchema = createInsertSchema(stores, {
  name: z.string().min(1).max(100),
  address: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  taxId: z.string().max(50).optional(),
  active: z.boolean().default(true),
});

export const updateStoreSchema = createSelectSchema(stores, {
  id: z.string().uuid(),
}).merge(insertStoreSchema.partial());

export const selectStoreSchema = createSelectSchema(stores);

// Custom types
export type Store = z.infer<typeof selectStoreSchema>;
export type NewStore = z.infer<typeof insertStoreSchema>;
export type UpdateStore = z.infer<typeof updateStoreSchema>;

// Helper functions
export const formatStoreAddress = (store: Store) => {
  return store.address?.replace(/\n/g, ', ') || '';
};

export const getStoreContactInfo = (store: Store) => {
  const contact: string[] = [];
  if (store.phone) contact.push(`Tel: ${store.phone}`);
  if (store.email) contact.push(`Email: ${store.email}`);
  return contact.join(' | ');
}; 