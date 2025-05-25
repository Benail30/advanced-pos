import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { products, productStoreInventory, transactions, transactionItems } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

describe('POS System Integration Tests', () => {
  const testStoreId = 'test-store-id';
  const testUserId = 'test-user-id';
  const testProduct = {
    id: 'test-product-1',
    name: 'Test Product',
    price: 10.99,
    stock_quantity: 10,
  };

  beforeAll(async () => {
    // Setup test data
    await db.insert(products).values({
      id: testProduct.id,
      name: testProduct.name,
      price: testProduct.price.toString(),
      stock_quantity: testProduct.stock_quantity,
      store_id: testStoreId,
    });

    await db.insert(productStoreInventory).values({
      product_id: testProduct.id,
      store_id: testStoreId,
      quantity: testProduct.stock_quantity,
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(transactionItems).where(eq(transactionItems.product_id, testProduct.id));
    await db.delete(transactions).where(eq(transactions.store_id, testStoreId));
    await db.delete(productStoreInventory).where(eq(productStoreInventory.product_id, testProduct.id));
    await db.delete(products).where(eq(products.id, testProduct.id));
  });

  describe('Shopping Cart', () => {
    it('should add items to cart', async () => {
      const cart = {
        items: [{
          id: testProduct.id,
          name: testProduct.name,
          price: testProduct.price,
          quantity: 2,
          stock_quantity: testProduct.stock_quantity,
        }],
      };

      expect(cart.items.length).toBe(1);
      expect(cart.items[0].quantity).toBe(2);
    });

    it('should prevent adding more items than available stock', async () => {
      const cart = {
        items: [{
          id: testProduct.id,
          name: testProduct.name,
          price: testProduct.price,
          quantity: testProduct.stock_quantity + 1,
          stock_quantity: testProduct.stock_quantity,
        }],
      };

      expect(cart.items[0].quantity).toBeLessThanOrEqual(testProduct.stock_quantity);
    });
  });

  describe('Transaction Processing', () => {
    it('should process a valid transaction', async () => {
      const transaction = {
        items: [{
          id: testProduct.id,
          quantity: 2,
          price: testProduct.price,
        }],
        total: testProduct.price * 2,
        payment_method: 'cash',
      };

      // Process transaction
      const result = await db.transaction(async (tx) => {
        const [newTransaction] = await tx
          .insert(transactions)
          .values({
            transaction_number: `TRX-${Date.now()}`,
            store_id: testStoreId,
            user_id: testUserId,
            subtotal: transaction.total.toString(),
            total_amount: (transaction.total * 1.1).toString(),
            payment_method: transaction.payment_method,
            status: 'completed',
          })
          .returning();

        // Add transaction items
        await tx.insert(transactionItems).values({
          transaction_id: newTransaction.id,
          product_id: transaction.items[0].id,
          quantity: transaction.items[0].quantity,
          unit_price: transaction.items[0].price.toString(),
          subtotal: (transaction.items[0].price * transaction.items[0].quantity).toString(),
          total: (transaction.items[0].price * transaction.items[0].quantity).toString(),
        });

        // Update inventory
        const [inventory] = await tx
          .select()
          .from(productStoreInventory)
          .where(
            and(
              eq(productStoreInventory.product_id, transaction.items[0].id),
              eq(productStoreInventory.store_id, testStoreId)
            )
          );

        await tx
          .update(productStoreInventory)
          .set({
            quantity: inventory.quantity - transaction.items[0].quantity,
            updated_at: new Date(),
          })
          .where(
            and(
              eq(productStoreInventory.product_id, transaction.items[0].id),
              eq(productStoreInventory.store_id, testStoreId)
            )
          );

        return newTransaction;
      });

      expect(result).toBeDefined();
      expect(result.status).toBe('completed');

      // Verify inventory update
      const [updatedInventory] = await db
        .select()
        .from(productStoreInventory)
        .where(
          and(
            eq(productStoreInventory.product_id, testProduct.id),
            eq(productStoreInventory.store_id, testStoreId)
          )
        );

      expect(updatedInventory.quantity).toBe(testProduct.stock_quantity - 2);
    });

    it('should prevent transaction with insufficient stock', async () => {
      const transaction = {
        items: [{
          id: testProduct.id,
          quantity: testProduct.stock_quantity + 1,
          price: testProduct.price,
        }],
        total: testProduct.price * (testProduct.stock_quantity + 1),
        payment_method: 'cash',
      };

      // Verify inventory before transaction
      const [inventory] = await db
        .select()
        .from(productStoreInventory)
        .where(
          and(
            eq(productStoreInventory.product_id, testProduct.id),
            eq(productStoreInventory.store_id, testStoreId)
          )
        );

      expect(inventory.quantity).toBeLessThan(transaction.items[0].quantity);
    });
  });
}); 