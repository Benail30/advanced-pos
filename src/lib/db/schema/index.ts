// Export all database schemas
export * from './users';
export * from './stores';
export * from './products';
export * from './categories';
export * from './customers';
export * from './orders';
export * from './order_items';
export * from './payments';
export * from './invoices';

// Add relation helpers
import { relations } from 'drizzle-orm';
import { 
  users, stores, categories, products, 
  customers, orders, orderItems, payments, invoices 
} from './';

// Users to Store relation
export const usersRelations = relations(users, ({ one }) => ({
  store: one(stores, {
    fields: [users.storeId],
    references: [stores.id],
  })
}));

// Store relations
export const storesRelations = relations(stores, ({ many }) => ({
  users: many(users),
  products: many(products),
  customers: many(customers)
}));

// Products relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
  orderItems: many(orderItems)
}));

// Categories relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products)
}));

// Orders relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  cashier: one(users, {
    fields: [orders.cashierId],
    references: [users.id],
  }),
  items: many(orderItems),
  payment: one(payments, {
    fields: [orders.id],
    references: [payments.orderId],
  }),
  invoice: one(invoices, {
    fields: [orders.id],
    references: [invoices.orderId],
  })
}));

// Order items relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  })
}));

// Payments relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  })
}));

// Invoices relations
export const invoicesRelations = relations(invoices, ({ one }) => ({
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id],
  })
})); 