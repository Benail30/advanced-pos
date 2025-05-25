import { db } from '../../../db';
import { stores, users, categories, products } from '../../../db/schema';
import { userRoleEnum } from '../../../db/schema';
import { randomUUID } from 'crypto';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create default store
    console.log('Creating default store...');
    const [defaultStore] = await db.insert(stores).values({
      name: 'Main Store',
      address: '123 Main Street, City',
      phone: '123-456-7890',
      email: 'store@example.com',
      tax_id: '12345678',
    }).returning();

    if (!defaultStore) {
      throw new Error('Failed to create default store');
    }

    console.log(`Default store created with ID: ${defaultStore.id}`);

    // Create admin user
    console.log('Creating admin user...');
    await db.insert(users).values({
      email: 'admin@example.com',
      password_hash: '$2a$12$DQtFNjxHLEjOsAqxD9fXWOCB.ve2Q8eUzuLwDrLp7YF2pCyXmxpLm', // hashed password: Admin123!
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      store_id: defaultStore.id,
    });

    // Create sample categories
    console.log('Creating sample categories...');
    const [electronicsCategory] = await db.insert(categories).values({
      name: 'Electronics',
      description: 'Electronic devices and accessories',
    }).returning();

    const [clothingCategory] = await db.insert(categories).values({
      name: 'Clothing',
      description: 'Shirts, pants, and other apparel',
    }).returning();

    // Create sample products
    console.log('Creating sample products...');
    await db.insert(products).values([
      {
        sku: 'PROD-001',
        barcode: '123456789',
        name: 'Smartphone',
        description: 'High-end smartphone with great camera',
        price: '699.99',
        cost_price: '450.00',
        category_id: electronicsCategory.id,
        tax_rate: '7.5',
        stock_quantity: 25,
        min_stock_level: 5,
      },
      {
        sku: 'PROD-002',
        barcode: '987654321',
        name: 'Laptop',
        description: 'Powerful laptop for work and gaming',
        price: '1299.99',
        cost_price: '900.00',
        category_id: electronicsCategory.id,
        tax_rate: '7.5',
        stock_quantity: 15,
        min_stock_level: 3,
      },
      {
        sku: 'PROD-003',
        barcode: '456789123',
        name: 'T-Shirt',
        description: 'Cotton t-shirt, very comfortable',
        price: '19.99',
        cost_price: '5.00',
        category_id: clothingCategory.id,
        tax_rate: '5.0',
        stock_quantity: 100,
        min_stock_level: 20,
      },
    ]);

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error during seeding:', error);
    process.exit(1);
  }); 