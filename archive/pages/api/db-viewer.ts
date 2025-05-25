import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { stores, categories, products, productStoreInventory } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const tableParam = req.query.table as string | undefined;
    
    // If no table is specified, return a list of available tables with counts
    if (!tableParam) {
      const storesCount = await db.select({ count: sql`count(*)` }).from(stores);
      const categoriesCount = await db.select({ count: sql`count(*)` }).from(categories);
      const productsCount = await db.select({ count: sql`count(*)` }).from(products);
      const inventoryCount = await db.select({ count: sql`count(*)` }).from(productStoreInventory);
      
      return res.status(200).json({
        tables: [
          { name: 'stores', count: parseInt(storesCount[0].count as any) || 0 },
          { name: 'categories', count: parseInt(categoriesCount[0].count as any) || 0 },
          { name: 'products', count: parseInt(productsCount[0].count as any) || 0 },
          { name: 'inventory', count: parseInt(inventoryCount[0].count as any) || 0 }
        ],
        total: {
          stores: parseInt(storesCount[0].count as any) || 0,
          categories: parseInt(categoriesCount[0].count as any) || 0,
          products: parseInt(productsCount[0].count as any) || 0,
          inventory: parseInt(inventoryCount[0].count as any) || 0
        }
      });
    }

    // Otherwise, return the data for the specified table
    let data;
    let schema = [];
    
    switch (tableParam) {
      case 'stores':
        data = await db.select().from(stores);
        schema = [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'name', type: 'text', isRequired: true },
          { name: 'address', type: 'text' },
          { name: 'phone', type: 'text' },
          { name: 'email', type: 'text' },
          { name: 'tax_id', type: 'text' },
          { name: 'active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp' },
          { name: 'updated_at', type: 'timestamp' }
        ];
        break;
      case 'categories':
        data = await db.select().from(categories);
        schema = [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'name', type: 'text', isRequired: true },
          { name: 'description', type: 'text' },
          { name: 'parent_id', type: 'uuid', isForeignKey: true, references: 'categories.id' },
          { name: 'image_url', type: 'text' },
          { name: 'active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp' },
          { name: 'updated_at', type: 'timestamp' }
        ];
        break;
      case 'products':
        data = await db.select().from(products);
        schema = [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'name', type: 'text', isRequired: true },
          { name: 'description', type: 'text' },
          { name: 'sku', type: 'text', isRequired: true, isUnique: true },
          { name: 'barcode', type: 'text', isUnique: true },
          { name: 'price', type: 'decimal', isRequired: true },
          { name: 'cost_price', type: 'decimal' },
          { name: 'category_id', type: 'uuid', isForeignKey: true, references: 'categories.id' },
          { name: 'store_id', type: 'uuid', isForeignKey: true, references: 'stores.id' },
          { name: 'stock_quantity', type: 'integer', default: 0 },
          { name: 'min_stock_level', type: 'integer', default: 0 },
          { name: 'max_stock_level', type: 'integer' },
          { name: 'active', type: 'boolean', default: true },
          { name: 'image_url', type: 'text' },
          { name: 'created_at', type: 'timestamp' },
          { name: 'updated_at', type: 'timestamp' }
        ];
        break;
      case 'inventory':
        data = await db.select().from(productStoreInventory);
        schema = [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'product_id', type: 'uuid', isRequired: true, isForeignKey: true, references: 'products.id' },
          { name: 'store_id', type: 'uuid', isRequired: true, isForeignKey: true, references: 'stores.id' },
          { name: 'quantity', type: 'integer', isRequired: true, default: 0 },
          { name: 'location', type: 'varchar' },
          { name: 'updated_at', type: 'timestamp' }
        ];
        break;
      default:
        return res.status(404).json({ error: 'Table not found' });
    }

    return res.status(200).json({ 
      table: tableParam, 
      data,
      schema,
      count: data.length
    });
  } catch (error) {
    console.error('Error in db-viewer API:', error);
    return res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
} 