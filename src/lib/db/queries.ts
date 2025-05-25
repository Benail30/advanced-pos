import { db } from "./index";
import { categories, products, stores, users, customers, transactions, transactionItems } from './schema';
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm';

// Configure the query builder
export const queries = {
  // Categories queries
  categories: {
    findAll: () => db.select().from(categories),
    findById: (id: string) => db.select().from(categories).where(eq(categories.id, id)),
    findByParentId: (parentId: string | null) => {
      if (parentId === null) {
        return db.select().from(categories).where(sql`${categories.parent_id} IS NULL`);
      }
      return db.select().from(categories).where(eq(categories.parent_id, parentId));
    },
  },
  
  // Products queries
  products: {
    findAll: () => db.select().from(products),
    findById: (id: string) => db.select().from(products).where(eq(products.id, id)),
    findByCategoryId: (categoryId: string) => db.select().from(products).where(eq(products.category_id, categoryId)),
    findByName: (name: string) => db.select().from(products).where(like(products.name, `%${name}%`)),
  },
  
  // Stores queries
  stores: {
    findAll: () => db.select().from(stores),
    findById: (id: string) => db.select().from(stores).where(eq(stores.id, id)),
  },
  
  // Customers queries
  customers: {
    findAll: () => db.select().from(customers),
    findById: (id: string) => db.select().from(customers).where(eq(customers.id, id)),
    findByEmail: (email: string) => db.select().from(customers).where(eq(customers.email, email)),
  },
  
  // Transactions queries
  transactions: {
    findAll: () => db.select().from(transactions),
    findById: (id: string) => db.select().from(transactions).where(eq(transactions.id, id)),
    findByCustomerId: (customerId: string) => db.select().from(transactions).where(eq(transactions.customerId, customerId)),
    findByStatus: (status: string) => db.select().from(transactions).where(eq(transactions.status, status)),
  },
}; 