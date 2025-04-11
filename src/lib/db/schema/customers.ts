import { pgTable, uuid, varchar, timestamp, text, integer, date } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  loyaltyPoints: integer('loyalty_points').default(0),
  dateOfBirth: date('date_of_birth'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Define Zod schemas for validation
export const insertCustomerSchema = createInsertSchema(customers, {
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  loyaltyPoints: z.number().int().min(0).default(0),
  dateOfBirth: z.date().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createSelectSchema(customers, {
  id: z.string().uuid(),
}).merge(insertCustomerSchema.partial());

export const selectCustomerSchema = createSelectSchema(customers);

// Custom types
export type Customer = z.infer<typeof selectCustomerSchema>;
export type NewCustomer = z.infer<typeof insertCustomerSchema>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;

// Helper functions
export const getFullName = (customer: Customer) => {
  return `${customer.firstName} ${customer.lastName}`;
};

export const getAge = (customer: Customer) => {
  if (!customer.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(customer.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const getLoyaltyTier = (customer: Customer) => {
  const points = customer.loyaltyPoints || 0;
  if (points >= 1000) return 'PLATINUM';
  if (points >= 500) return 'GOLD';
  if (points >= 200) return 'SILVER';
  return 'BRONZE';
};

export const getContactInfo = (customer: Customer) => {
  const contact: string[] = [];
  if (customer.phone) contact.push(`Tel: ${customer.phone}`);
  if (customer.email) contact.push(`Email: ${customer.email}`);
  return contact.join(' | ');
}; 