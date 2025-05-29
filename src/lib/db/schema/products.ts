import { pgTable, uuid, varchar, decimal, integer, timestamp, text } from 'drizzle-orm/pg-core';
import { categories } from './categories';
import { stores } from './stores';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull().default(0),
  categoryId: uuid('category_id').references(() => categories.id),
  storeId: uuid('store_id').references(() => stores.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define types
export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: string;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProduct = Partial<NewProduct> & { id: string }; 