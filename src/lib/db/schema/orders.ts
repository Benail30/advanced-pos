import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';
import { customers } from './customers';

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export const orders = pgTable('orders', {
  id: varchar('id').primaryKey().$defaultFn(() => createId()),
  cashierId: varchar('cashier_id').notNull().references(() => users.id),
  customerId: varchar('customer_id').references(() => customers.id),
  total: text('total').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Define types
export type Order = {
  id: string;
  cashierId: string;
  customerId: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type NewOrder = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateOrder = Partial<NewOrder> & { id: string }; 