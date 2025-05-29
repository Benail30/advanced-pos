import { pgTable, uuid, varchar, boolean, timestamp, text } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  parentId: uuid('parent_id').references((): any => categories.id),
  imageUrl: varchar('image_url', { length: 255 }),
  active: boolean('active').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define types
export type Category = {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NewCategory = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCategory = Partial<NewCategory> & { id: string };

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