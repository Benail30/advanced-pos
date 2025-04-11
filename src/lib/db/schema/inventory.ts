import { pgTable, uuid, integer, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { products } from './products';
import { stores } from './stores';

export const productStoreInventory = pgTable('product_store_inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  quantity: integer('quantity').notNull().default(0),
  location: varchar('location', { length: 100 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    productStoreIdx: uniqueIndex('product_store_idx').on(table.productId, table.storeId),
  };
});

// Define Zod schemas for validation
export const insertInventorySchema = createInsertSchema(productStoreInventory, {
  quantity: z.coerce.number().int().default(0),
});

export const selectInventorySchema = createSelectSchema(productStoreInventory);

export type Inventory = z.infer<typeof selectInventorySchema>;
export type NewInventory = z.infer<typeof insertInventorySchema>; 