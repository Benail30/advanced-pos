import { pgTable, serial, text, timestamp, integer, boolean, varchar, decimal, uuid, jsonb, date, pgEnum, unique } from 'drizzle-orm/pg-core';
import { relations, type InferSelectModel } from 'drizzle-orm';
import type { PgTableWithColumns } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'cashier']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'credit_card', 'debit_card', 'e_wallet', 'bank_transfer']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'refunded', 'voided']);
export const stockHistoryTypeEnum = pgEnum('stock_history_type', ['purchase', 'sale', 'return', 'adjustment', 'transfer']);
export const stockTransferStatusEnum = pgEnum('stock_transfer_status', ['draft', 'pending', 'completed', 'canceled']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed_amount']);
export const discountAppliesToEnum = pgEnum('discount_applies_to', ['all', 'category', 'product']);
export const purchaseOrderStatusEnum = pgEnum('purchase_order_status', ['draft', 'pending', 'received', 'canceled']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  first_name: varchar('first_name', { length: 100 }).notNull(),
  last_name: varchar('last_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').notNull(),
  store_id: uuid('store_id').references(() => stores.id),
  active: boolean('active').notNull().default(true),
  last_login: timestamp('last_login', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Stores table
export const stores = pgTable('stores', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  tax_id: varchar('tax_id', { length: 50 }),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  parent_id: uuid('parent_id').references((): any => categories.id),
  image_url: varchar('image_url', { length: 255 }),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Define type for the categories table
export type Category = InferSelectModel<typeof categories>;

// Define explicit category relations to prevent "multiple relations" error
export const categoriesRelations = relations(categories, ({ one, many }) => {
  return {
    parent: one(categories, {
      fields: [categories.parent_id],
      references: [categories.id],
      relationName: 'category_parent',
    }),
    children: many(categories, {
      relationName: 'category_parent',
    }),
  };
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: varchar('sku', { length: 50 }).notNull().unique(),
  barcode: varchar('barcode', { length: 50 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  cost_price: decimal('cost_price', { precision: 10, scale: 2 }),
  category_id: uuid('category_id').references(() => categories.id),
  tax_rate: decimal('tax_rate', { precision: 5, scale: 2 }).notNull().default('0'),
  stock_quantity: integer('stock_quantity').notNull().default(0),
  min_stock_level: integer('min_stock_level').notNull().default(5),
  image_url: varchar('image_url', { length: 255 }),
  weight: decimal('weight', { precision: 10, scale: 3 }),
  dimensions: varchar('dimensions', { length: 50 }),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Product Store Inventory table
export const productStoreInventory = pgTable('product_store_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').references(() => products.id).notNull(),
  store_id: uuid('store_id').references(() => stores.id).notNull(),
  quantity: integer('quantity').notNull().default(0),
  location: varchar('location', { length: 100 }),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniq: unique().on(table.product_id, table.store_id),
}));

// Customers table
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  first_name: varchar('first_name', { length: 100 }).notNull(),
  last_name: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  loyalty_points: integer('loyalty_points').notNull().default(0),
  date_of_birth: date('date_of_birth'),
  notes: text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  transaction_number: varchar('transaction_number', { length: 50 }).notNull().unique(),
  store_id: uuid('store_id').references(() => stores.id).notNull(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  customer_id: uuid('customer_id').references(() => customers.id),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax_amount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull(),
  discount_amount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  payment_method: paymentMethodEnum('payment_method').notNull(),
  payment_reference: varchar('payment_reference', { length: 100 }),
  status: transactionStatusEnum('status').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Transaction Items table
export const transactionItems = pgTable('transaction_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  transaction_id: uuid('transaction_id').references(() => transactions.id, { onDelete: 'cascade' }).notNull(),
  product_id: uuid('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  unit_price: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  tax_rate: decimal('tax_rate', { precision: 5, scale: 2 }).notNull(),
  tax_amount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull(),
  discount_amount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
});

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  transaction_id: uuid('transaction_id').references(() => transactions.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  payment_method: paymentMethodEnum('payment_method').notNull(),
  payment_reference: varchar('payment_reference', { length: 100 }),
  status: transactionStatusEnum('status').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Stock History table
export const stockHistory = pgTable('stock_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  store_id: uuid('store_id').references(() => stores.id).notNull(),
  product_id: uuid('product_id').references(() => products.id).notNull(),
  quantity_change: integer('quantity_change').notNull(),
  type: stockHistoryTypeEnum('type').notNull(),
  reference_id: uuid('reference_id'),
  notes: text('notes'),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Stock Transfers table
export const stockTransfers = pgTable('stock_transfers', {
  id: uuid('id').primaryKey().defaultRandom(),
  reference_number: varchar('reference_number', { length: 50 }).notNull().unique(),
  source_store_id: uuid('source_store_id').references(() => stores.id).notNull(),
  destination_store_id: uuid('destination_store_id').references(() => stores.id).notNull(),
  status: stockTransferStatusEnum('status').notNull(),
  notes: text('notes'),
  created_by: uuid('created_by').references(() => users.id).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Stock Transfer Items table
export const stockTransferItems = pgTable('stock_transfer_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  transfer_id: uuid('transfer_id').references(() => stockTransfers.id, { onDelete: 'cascade' }).notNull(),
  product_id: uuid('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
});

// Discounts table
export const discounts = pgTable('discounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  discount_type: discountTypeEnum('discount_type').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  min_purchase_amount: decimal('min_purchase_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  applies_to: discountAppliesToEnum('applies_to'),
  target_id: uuid('target_id'),
  start_date: timestamp('start_date', { withTimezone: true }).notNull(),
  end_date: timestamp('end_date', { withTimezone: true }),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Suppliers table
export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  contact_person: varchar('contact_person', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  tax_id: varchar('tax_id', { length: 50 }),
  notes: text('notes'),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Purchase Orders table
export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  po_number: varchar('po_number', { length: 50 }).notNull().unique(),
  store_id: uuid('store_id').references(() => stores.id).notNull(),
  supplier_id: uuid('supplier_id').references(() => suppliers.id).notNull(),
  status: purchaseOrderStatusEnum('status').notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax_amount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull(),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  expected_delivery_date: date('expected_delivery_date'),
  created_by: uuid('created_by').references(() => users.id).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Purchase Order Items table
export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  purchase_order_id: uuid('purchase_order_id').references(() => purchaseOrders.id, { onDelete: 'cascade' }).notNull(),
  product_id: uuid('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  unit_cost: decimal('unit_cost', { precision: 10, scale: 2 }).notNull(),
  tax_rate: decimal('tax_rate', { precision: 5, scale: 2 }).notNull().default('0'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
});

// Audit Log table
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  table_name: varchar('table_name', { length: 100 }).notNull(),
  record_id: uuid('record_id'),
  old_values: jsonb('old_values'),
  new_values: jsonb('new_values'),
  ip_address: varchar('ip_address', { length: 45 }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Settings table
export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  store_id: uuid('store_id').references(() => stores.id),
  key: varchar('key', { length: 100 }).notNull(),
  value: text('value'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniq: unique().on(table.store_id, table.key),
})); 