import { pgTable, text, uuid, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { stores } from './stores';

// Create role enum with only admin and cashier roles
export const userRoleEnum = pgEnum('user_role', ['admin', 'cashier']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: userRoleEnum('role').notNull(),
  storeId: uuid('store_id'),
  active: boolean('active').default(true),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(['admin', 'cashier']),
  storeId: z.string().uuid().optional(),
  // Don't include password hash in validation - it would be handled separately with bcrypt
}).omit({ passwordHash: true }).extend({ 
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password confirmation is required") 
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"]
});

export const selectUserSchema = createSelectSchema(users);

export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;

// Helper functions
export const getFullName = (user: User) => {
  return `${user.firstName} ${user.lastName}`;
};

export const isAdmin = (user: User) => {
  return user.role === 'admin';
};

export const isCashier = (user: User) => {
  return user.role === 'cashier';
};

export const canManageUsers = (user: User) => {
  return isAdmin(user);
};

export const canManageProducts = (user: User) => {
  return isAdmin(user);
};

export const canViewReports = (user: User) => {
  return isAdmin(user);
}; 