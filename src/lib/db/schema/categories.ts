import { pgTable, uuid, varchar, boolean, timestamp, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  parentId: uuid('parent_id').references((): any => categories.id),
  imageUrl: varchar('image_url', { length: 255 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define Zod schemas for validation
export const insertCategorySchema = createInsertSchema(categories, {
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional(),
  active: z.boolean().default(true),
});

export const updateCategorySchema = createSelectSchema(categories, {
  id: z.string().uuid(),
}).merge(insertCategorySchema.partial());

export const selectCategorySchema = createSelectSchema(categories);

// Custom types
export type Category = z.infer<typeof selectCategorySchema>;
export type NewCategory = z.infer<typeof insertCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

// Helper functions
export const isRootCategory = (category: Category) => {
  return !category.parentId;
};

export const getCategoryPath = async (category: Category, getCategory: (id: string) => Promise<Category | null>) => {
  const path: Category[] = [category];
  let current = category;
  
  while (current.parentId) {
    const parent = await getCategory(current.parentId);
    if (!parent) break;
    path.unshift(parent);
    current = parent;
  }
  
  return path;
}; 