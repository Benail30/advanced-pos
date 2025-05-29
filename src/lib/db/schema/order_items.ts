import { pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { orders } from './orders';
import { products } from './products';

export const orderItems = pgTable('order_items', {
  id: varchar('id').primaryKey().$defaultFn(() => createId()),
  orderId: varchar('order_id').notNull().references(() => orders.id),
  productId: varchar('product_id').notNull().references(() => products.id),
  quantity: text('quantity').notNull(),
  priceAtSale: text('price_at_sale').notNull()
});

// Define types
export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtSale: number;
};

export type NewOrderItem = Omit<OrderItem, 'id'>;
export type UpdateOrderItem = Partial<NewOrderItem> & { id: string }; 