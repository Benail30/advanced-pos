import { pgTable, uuid, varchar, boolean, timestamp, text, decimal, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { categories } from './categories';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: varchar('sku', { length: 50 }).notNull().unique(),
  barcode: varchar('barcode', { length: 50 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  categoryId: uuid('category_id').references(() => categories.id),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0.00'),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  minStockLevel: integer('min_stock_level').notNull().default(5),
  imageUrl: varchar('image_url', { length: 255 }),
  weight: decimal('weight', { precision: 10, scale: 3 }),
  dimensions: varchar('dimensions', { length: 50 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define Zod schemas for validation
export const insertProductSchema = createInsertSchema(products, {
  sku: z.string().min(3).max(50).regex(/^[A-Za-z0-9-_]+$/),
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  price: z.coerce.number().positive().min(0.01),
  costPrice: z.coerce.number().positive().min(0.01).optional(),
  categoryId: z.string().uuid().optional(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  minStockLevel: z.coerce.number().int().min(0).default(5),
  imageUrl: z.string().url().optional(),
  weight: z.coerce.number().positive().optional(),
  dimensions: z.string().regex(/^\d+x\d+x\d+$/).optional(),
  active: z.boolean().default(true),
});

export const updateProductSchema = createSelectSchema(products, {
  id: z.string().uuid(),
}).merge(insertProductSchema.partial());

export const selectProductSchema = createSelectSchema(products);

// Custom types
export type Product = z.infer<typeof selectProductSchema>;
export type NewProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

// Helper type for product dimensions
export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

// Computed properties helper functions
export const computeProductValue = (product: Product) => {
  return Number(product.price) * product.stockQuantity;
};

export const isLowStock = (product: Product) => {
  return product.stockQuantity <= product.minStockLevel;
};

export const getTotalValue = (product: Product) => {
  return Number(product.price) * product.stockQuantity;
};

export const getProfit = (product: Product) => {
  if (!product.costPrice) return null;
  return Number(product.price) - Number(product.costPrice);
};

export const getProfitMargin = (product: Product) => {
  const profit = getProfit(product);
  if (profit === null) return null;
  return (profit / Number(product.price)) * 100;
}; 