import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { stores } from './stores';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  password: varchar('password', { length: 255 }), // Hashed password for cashiers
  storeId: uuid('store_id').references(() => stores.id),
  active: boolean('active').default(true),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define types
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  storeId?: string;
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type NewUser = Omit<User, 'id' | 'lastLogin' | 'createdAt' | 'updatedAt'>;
export type UpdateUser = Partial<NewUser> & { id: string };

// Helper functions
export const getFullName = (user: User) => {
  return `${user.firstName} ${user.lastName}`;
}; 