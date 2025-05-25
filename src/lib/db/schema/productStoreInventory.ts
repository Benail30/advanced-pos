import { pgTable, uuid, varchar, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
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
export const insertProductStoreInventorySchema = createInsertSchema(productStoreInventory, {
  productId: z.string().uuid(),
  storeId: z.string().uuid(),
  quantity: z.number().int().min(0),
  location: z.string().max(100).optional(),
});

export const updateProductStoreInventorySchema = createSelectSchema(productStoreInventory, {
  id: z.string().uuid(),
}).merge(insertProductStoreInventorySchema.partial());

export const selectProductStoreInventorySchema = createSelectSchema(productStoreInventory);

// Custom types
export type ProductStoreInventory = z.infer<typeof selectProductStoreInventorySchema>;
export type NewProductStoreInventory = z.infer<typeof insertProductStoreInventorySchema>;
export type UpdateProductStoreInventory = z.infer<typeof updateProductStoreInventorySchema>;

// Helper functions
export const isOutOfStock = (inventory: ProductStoreInventory) => {
  return inventory.quantity <= 0;
};

export const getInventoryStatus = (inventory: ProductStoreInventory, minLevel: number = 5) => {
  if (inventory.quantity <= 0) return 'out_of_stock';
  if (inventory.quantity <= minLevel) return 'low_stock';
  return 'in_stock';
}; 