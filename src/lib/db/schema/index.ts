// Export all database schemas
export * from './users';
export * from './stores';
export * from './products';
export * from './categories';
export * from './transactions';
export * from './transaction-items';
export * from './customers';
export * from './inventory';
export * from './payments';
export * from './stockHistory';
export * from './stockTransfers';
export * from './stockTransferItems';
export * from './discounts';
export * from './suppliers';
export * from './purchaseOrders';
export * from './purchaseOrderItems';
export * from './auditLog';
export * from './settings';

// Add relation helpers
import { relations } from 'drizzle-orm';
import { 
  users, stores, categories, products, 
  productStoreInventory, customers,
  transactions, transactionItems, payments,
  stockHistory, stockTransfers, stockTransferItems,
  discounts, suppliers, purchaseOrders, purchaseOrderItems,
  auditLog, settings
} from './';

// Users to Stores relation
export const usersRelations = relations(users, ({ one }) => ({
  store: one(stores, {
    fields: [users.storeId],
    references: [stores.id],
  }),
}));

// Products to Categories relation
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  inventory: many(productStoreInventory),
  transactionItems: many(transactionItems),
  purchaseOrderItems: many(purchaseOrderItems),
  stockTransferItems: many(stockTransferItems),
  stockHistory: many(stockHistory),
}));

// Categories self relation (for hierarchical categories)
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  products: many(products),
}));

// Store inventory relations
export const storesRelations = relations(stores, ({ many }) => ({
  users: many(users),
  inventory: many(productStoreInventory),
  transactions: many(transactions),
  stockHistory: many(stockHistory),
  sourceTransfers: many(stockTransfers, { relationName: 'sourceStore' }),
  destinationTransfers: many(stockTransfers, { relationName: 'destinationStore' }),
  purchaseOrders: many(purchaseOrders),
  settings: many(settings),
}));

// Product inventory relations
export const inventoryRelations = relations(productStoreInventory, ({ one }) => ({
  product: one(products, {
    fields: [productStoreInventory.productId],
    references: [products.id],
  }),
  store: one(stores, {
    fields: [productStoreInventory.storeId],
    references: [stores.id],
  }),
}));

// Transactions relations
export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  store: one(stores, {
    fields: [transactions.storeId],
    references: [stores.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id],
  }),
  items: many(transactionItems),
  payments: many(payments),
}));

// Transaction items relations
export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionItems.transactionId],
    references: [transactions.id],
  }),
  product: one(products, {
    fields: [transactionItems.productId],
    references: [products.id],
  }),
}));

// Payments relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  transaction: one(transactions, {
    fields: [payments.transactionId],
    references: [transactions.id],
  }),
}));

// Stock history relations
export const stockHistoryRelations = relations(stockHistory, ({ one }) => ({
  store: one(stores, {
    fields: [stockHistory.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [stockHistory.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [stockHistory.userId],
    references: [users.id],
  }),
}));

// Stock transfers relations
export const stockTransfersRelations = relations(stockTransfers, ({ one, many }) => ({
  sourceStore: one(stores, {
    fields: [stockTransfers.sourceStoreId],
    references: [stores.id],
  }),
  destinationStore: one(stores, {
    fields: [stockTransfers.destinationStoreId],
    references: [stores.id],
  }),
  createdBy: one(users, {
    fields: [stockTransfers.createdBy],
    references: [users.id],
  }),
  items: many(stockTransferItems),
}));

// Stock transfer items relations
export const stockTransferItemsRelations = relations(stockTransferItems, ({ one }) => ({
  transfer: one(stockTransfers, {
    fields: [stockTransferItems.transferId],
    references: [stockTransfers.id],
  }),
  product: one(products, {
    fields: [stockTransferItems.productId],
    references: [products.id],
  }),
}));

// Purchase orders relations
export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  store: one(stores, {
    fields: [purchaseOrders.storeId],
    references: [stores.id],
  }),
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
  createdBy: one(users, {
    fields: [purchaseOrders.createdBy],
    references: [users.id],
  }),
  items: many(purchaseOrderItems),
}));

// Purchase order items relations
export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  product: one(products, {
    fields: [purchaseOrderItems.productId],
    references: [products.id],
  }),
}));

// Audit log relations
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));

// Settings relations
export const settingsRelations = relations(settings, ({ one }) => ({
  store: one(stores, {
    fields: [settings.storeId],
    references: [stores.id],
  }),
})); 