import { pgTable, uuid, varchar, boolean, timestamp, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { stores } from './stores';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  storeId: uuid('store_id').references(() => stores.id),
  active: boolean('active').default(true),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define role enum
export const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// Define Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  passwordHash: z.string().min(60).max(255), // bcrypt hash length
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]),
  storeId: z.string().uuid().optional(),
  active: z.boolean().default(true),
});

export const updateUserSchema = createSelectSchema(users, {
  id: z.string().uuid(),
}).merge(insertUserSchema.partial());

export const selectUserSchema = createSelectSchema(users);

// Custom types
export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

// Helper functions
export const getFullName = (user: User) => {
  return `${user.firstName} ${user.lastName}`;
};

export const isAdmin = (user: User) => {
  return user.role === UserRole.ADMIN;
};

export const isManager = (user: User) => {
  return user.role === UserRole.MANAGER;
};

export const isCashier = (user: User) => {
  return user.role === UserRole.CASHIER;
};

export const canManageUsers = (user: User) => {
  return isAdmin(user) || isManager(user);
};

export const canManageProducts = (user: User) => {
  return isAdmin(user) || isManager(user);
};

export const canViewReports = (user: User) => {
  return isAdmin(user) || isManager(user);
}; 