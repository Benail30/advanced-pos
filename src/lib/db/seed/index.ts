import { db } from '../index';
import * as schema from '../schema';
import * as crypto from 'crypto';

/**
 * Simple hash function for creating password hashes
 * In a production app, use bcrypt or similar
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seed() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Check if we already have data
    const existingStores = await db.select().from(schema.stores).limit(1);
    
    if (existingStores.length > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }
    
    // Create a default store
    const [store] = await db.insert(schema.stores).values({
      name: 'Main Store',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      phone: '555-123-4567',
      email: 'store@example.com',
      active: true,
    }).returning();
    
    console.log('Created store:', store.name);
    
    // Create admin user
    const [user] = await db.insert(schema.users).values({
      email: 'admin@example.com',
      passwordHash: hashPassword('admin123'), // In production, use proper password hashing!
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      storeId: store.id,
      active: true,
    }).returning();
    
    console.log('Created admin user:', user.email);
    
    // Create a sample category
    const [category] = await db.insert(schema.categories).values({
      name: 'General',
      description: 'General products',
      active: true,
    }).returning();
    
    console.log('Created category:', category.name);
    
    // Create a sample product
    const [product] = await db.insert(schema.products).values({
      name: 'Sample Product',
      description: 'This is a sample product',
      sku: 'SAMPLE001',
      barcode: '1234567890123',
      price: 9.99,
      cost: 5.99,
      categoryId: category.id,
      active: true,
      taxable: true,
      taxRate: 0.07,
    }).returning();
    
    console.log('Created product:', product.name);
    
    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
}

// Run seed function if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error during seeding:', error);
      process.exit(1);
    });
}

export { seed }; 