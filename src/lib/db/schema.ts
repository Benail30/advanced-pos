import { pgTable, uuid, varchar, timestamp, text, boolean, integer, decimal, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['admin', 'cashier']);
export const transactionStatusEnum = pgEnum('transaction_status', ['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED']);

// Stores table
export const stores = pgTable('stores', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  tax_id: text('tax_id'),
  active: boolean('active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  parent_id: uuid('parent_id').references((): any => categories.id),
  image_url: text('image_url'),
  active: boolean('active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: roleEnum('role').notNull().default('cashier'),
  storeId: uuid('store_id').references(() => stores.id),
  active: boolean('active').default(true),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Customers table
export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  first_name: varchar('first_name', { length: 255 }).notNull(),
  last_name: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  loyalty_points: integer('loyalty_points').default(0),
  date_of_birth: timestamp('date_of_birth'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock_quantity: integer('stock_quantity').notNull().default(0),
  reorder_point: integer('reorder_point').notNull().default(5),
  category: varchar('category', { length: 100 }),
  sku: varchar('sku', { length: 100 }).unique(),
  image_url: text('image_url'),
  barcode: text('barcode').unique(),
  cost_price: decimal('cost_price', { precision: 10, scale: 2 }),
  category_id: uuid('category_id').references(() => categories.id),
  store_id: uuid('store_id').references(() => stores.id),
  min_stock_level: integer('min_stock_level').default(0),
  max_stock_level: integer('max_stock_level'),
  active: boolean('active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Product Store Inventory table
export const productStoreInventory = pgTable('product_store_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull().references(() => products.id),
  store_id: uuid('store_id').notNull().references(() => stores.id),
  quantity: integer('quantity').notNull().default(0),
  location: varchar('location', { length: 100 }),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  transaction_number: varchar('transaction_number', { length: 50 }).notNull().unique(),
  customer_id: uuid('customer_id').references(() => customers.id),
  store_id: uuid('store_id').references(() => stores.id),
  user_id: uuid('user_id').references(() => users.id),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  payment_method: varchar('payment_method', { length: 50 }).notNull(),
  payment_reference: varchar('payment_reference', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull().default('completed'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Transaction Items table
export const transactionItems = pgTable('transaction_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  transaction_id: uuid('transaction_id').references(() => transactions.id, { onDelete: 'cascade' }).notNull(),
  product_id: uuid('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  unit_price: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Invoices table
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').references(() => transactions.id).notNull(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  qrCode: text('qr_code'),
  pdfUrl: text('pdf_url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parent_id],
    references: [categories.id],
    relationName: 'category_parent'
  }),
  children: many(categories, {
    relationName: 'category_parent'
  })
}));

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions)
}));

export const customersRelations = relations(customers, ({ many }) => ({
  transactions: many(transactions)
}));

export const productsRelations = relations(products, ({ many }) => ({
  transactionItems: many(transactionItems)
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  customer: one(customers, {
    fields: [transactions.customer_id],
    references: [customers.id]
  }),
  items: many(transactionItems)
}));

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionItems.transaction_id],
    references: [transactions.id]
  }),
  product: one(products, {
    fields: [transactionItems.product_id],
    references: [products.id]
  })
}));

// Relations for product store inventory
export const productStoreInventoryRelations = relations(productStoreInventory, ({ one }) => ({
  product: one(products, {
    fields: [productStoreInventory.product_id],
    references: [products.id]
  }),
  store: one(stores, {
    fields: [productStoreInventory.store_id],
    references: [stores.id]
  })
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  transaction: one(transactions, {
    fields: [invoices.transactionId],
    references: [transactions.id]
  })
}));

// Types for database operations
export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type TransactionItem = typeof transactionItems.$inferSelect;
export type NewTransactionItem = typeof transactionItems.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert; 