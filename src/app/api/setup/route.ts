import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories, customers, stores } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  try {
    // Check if we already have data in the database
    const existingProducts = await db.select({
      count: sql<number>`count(${products.id})`
    })
    .from(products)
    .then(res => Number(res[0]?.count || 0));

    if (existingProducts > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Setup already completed. Database has existing data.',
        existingProducts
      });
    }

    // Create a default store
    const storeId = uuidv4();
    await db.insert(stores).values({
      id: storeId,
      name: 'My POS Store',
      address: '123 Main Street, City, Country',
      phone: '+1 555-123-4567',
      email: 'contact@myposstore.com',
      tax_id: 'TAX123456',
      active: true
    });

    // Create categories with their IDs
    const electronics = uuidv4();
    const clothing = uuidv4();
    const food = uuidv4();
    const home = uuidv4();
    const office = uuidv4();

    await db.insert(categories).values([
      {
        id: electronics,
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        active: true
      },
      {
        id: clothing,
        name: 'Clothing',
        description: 'Apparel and fashion items',
        active: true
      },
      {
        id: food,
        name: 'Food & Beverages',
        description: 'Consumable items',
        active: true
      },
      {
        id: home,
        name: 'Home & Kitchen',
        description: 'Home appliances and kitchenware',
        active: true
      },
      {
        id: office,
        name: 'Office Supplies',
        description: 'Stationery and office equipment',
        active: true
      }
    ]);

    // Create products
    const productValues = [
      // Electronics
      {
        id: uuidv4(),
        name: 'Smartphone XS',
        description: 'Latest smartphone with advanced features',
        price: '899.99',
        stock_quantity: 25,
        category: 'Electronics',
        sku: 'ELEC-PHONE-001',
        reorder_point: 5,
        min_stock_level: 3,
        max_stock_level: 30,
        cost_price: '650',
        category_id: electronics,
        store_id: storeId
      },
      {
        id: uuidv4(),
        name: 'Bluetooth Headphones',
        description: 'Wireless noise-canceling headphones',
        price: '149.99',
        stock_quantity: 40,
        category: 'Electronics',
        sku: 'ELEC-AUDIO-002',
        reorder_point: 10,
        min_stock_level: 5,
        max_stock_level: 50,
        cost_price: '85',
        category_id: electronics,
        store_id: storeId
      },
      // Clothing
      {
        id: uuidv4(),
        name: 'T-Shirt',
        description: 'Cotton crew neck t-shirt',
        price: '19.99',
        stock_quantity: 100,
        category: 'Clothing',
        sku: 'CLOTH-TS-001',
        reorder_point: 20,
        min_stock_level: 15,
        max_stock_level: 120,
        cost_price: '8',
        category_id: clothing,
        store_id: storeId
      },
      {
        id: uuidv4(),
        name: 'Jeans',
        description: 'Classic fit denim jeans',
        price: '49.99',
        stock_quantity: 75,
        category: 'Clothing',
        sku: 'CLOTH-JN-002',
        reorder_point: 15,
        min_stock_level: 10,
        max_stock_level: 80,
        cost_price: '22',
        category_id: clothing,
        store_id: storeId
      },
      // Food & Beverages
      {
        id: uuidv4(),
        name: 'Coffee Beans',
        description: 'Premium roasted coffee beans, 500g',
        price: '12.99',
        stock_quantity: 60,
        category: 'Food & Beverages',
        sku: 'FOOD-COF-001',
        reorder_point: 15,
        min_stock_level: 10,
        max_stock_level: 70,
        cost_price: '6.50',
        category_id: food,
        store_id: storeId
      },
      // Home & Kitchen
      {
        id: uuidv4(),
        name: 'Blender',
        description: 'High-speed blender with multiple settings',
        price: '79.99',
        stock_quantity: 30,
        category: 'Home & Kitchen',
        sku: 'HOME-BLD-001',
        reorder_point: 8,
        min_stock_level: 5,
        max_stock_level: 40,
        cost_price: '45',
        category_id: home,
        store_id: storeId
      },
      // Office Supplies
      {
        id: uuidv4(),
        name: 'Notebook',
        description: 'Hardcover ruled notebook, 200 pages',
        price: '9.99',
        stock_quantity: 150,
        category: 'Office Supplies',
        sku: 'OFFICE-NB-001',
        reorder_point: 30,
        min_stock_level: 25,
        max_stock_level: 200,
        cost_price: '4.50',
        category_id: office,
        store_id: storeId
      }
    ];

    await db.insert(products).values(productValues);
    
    // Create sample customers
    const customerData = [
      {
        id: uuidv4(),
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        address: '123 Main St, Anytown, AN 12345',
        loyalty_points: 150
      },
      {
        id: uuidv4(),
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-987-6543',
        address: '456 Oak Ave, Somewhere, SM 67890',
        loyalty_points: 200
      },
      {
        id: uuidv4(),
        first_name: 'Robert',
        last_name: 'Johnson',
        email: 'robert.johnson@example.com',
        phone: '555-456-7890',
        address: '789 Pine St, Nowhere, NW 54321',
        loyalty_points: 75
      }
    ];
    
    await db.insert(customers).values(customerData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database setup completed successfully',
      data: {
        store: { id: storeId, name: 'My POS Store' },
        categories: 5,
        products: productValues.length,
        customers: customerData.length
      }
    });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to set up database',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 