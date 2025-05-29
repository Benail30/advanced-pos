import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

// Get or create a store for a specific Auth0 admin
export async function getOrCreateAdminStore(auth0UserId: string, adminName: string = 'Admin') {
  try {
    // First, check if this admin already has a store
    const existingStore = await pool.query(`
      SELECT s.* FROM stores s
      JOIN store_admins sa ON s.id = sa.store_id
      WHERE sa.auth0_user_id = $1 AND sa.active = true
    `, [auth0UserId]);
    
    if (existingStore.rows.length > 0) {
      return existingStore.rows[0];
    }
    
    // Create a new store for this admin
    const storeName = `${adminName}'s Store`;
    const newStore = await pool.query(`
      INSERT INTO stores (name, address, phone)
      VALUES ($1, 'Store Location', '')
      RETURNING *
    `, [storeName]);
    
    // Link the admin to this store
    await pool.query(`
      INSERT INTO store_admins (store_id, auth0_user_id, active)
      VALUES ($1, $2, true)
      ON CONFLICT (store_id, auth0_user_id) 
      DO UPDATE SET active = true
    `, [newStore.rows[0].id, auth0UserId]);
    
    return newStore.rows[0];
  } catch (error) {
    console.error('Error managing admin store:', error);
    throw error;
  }
}

// Get the store_id for an Auth0 admin
export async function getAdminStoreId(auth0UserId: string): Promise<string | null> {
  try {
    const result = await pool.query(`
      SELECT s.id FROM stores s
      JOIN store_admins sa ON s.id = sa.store_id
      WHERE sa.auth0_user_id = $1 AND sa.active = true
    `, [auth0UserId]);
    
    return result.rows.length > 0 ? result.rows[0].id : null;
  } catch (error) {
    console.error('Error getting admin store ID:', error);
    return null;
  }
}

// Get the store_id for a cashier user (local JWT)
export async function getCashierStoreId(userId: string): Promise<string | null> {
  try {
    const result = await pool.query(`
      SELECT store_id FROM users WHERE id = $1
    `, [userId]);
    
    return result.rows.length > 0 ? result.rows[0].store_id : null;
  } catch (error) {
    console.error('Error getting cashier store ID:', error);
    return null;
  }
}

// Create the store_admins table if it doesn't exist
export async function ensureStoreAdminsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS store_admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        auth0_user_id VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(store_id, auth0_user_id)
      )
    `);
  } catch (error) {
    console.error('Error creating store_admins table:', error);
    throw error;
  }
}

// Initialize store for new admin on first login
export async function initializeAdminStore(auth0UserId: string, adminName: string) {
  try {
    // Ensure the store_admins table exists
    await ensureStoreAdminsTable();
    
    // Get or create store for this admin
    const store = await getOrCreateAdminStore(auth0UserId, adminName);
    
    // Create default categories for this store
    await createDefaultCategories(store.id);
    
    return store;
  } catch (error) {
    console.error('Error initializing admin store:', error);
    throw error;
  }
}

// Create default categories for a new store
async function createDefaultCategories(storeId: string) {
  try {
    const defaultCategories = [
      { name: 'Beverages', description: 'Drinks and beverages' },
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Health & Beauty', description: 'Health and beauty products' },
      { name: 'Home & Kitchen', description: 'Home and kitchen items' },
      { name: 'Office Supplies', description: 'Office and stationery supplies' },
      { name: 'Snacks & Candy', description: 'Snacks and confectionery' }
    ];
    
    for (const category of defaultCategories) {
      await pool.query(`
        INSERT INTO categories (name, description, store_id, active)
        VALUES ($1, $2, $3, true)
        ON CONFLICT (name, store_id) DO NOTHING
      `, [category.name, category.description, storeId]);
    }
  } catch (error) {
    console.error('Error creating default categories:', error);
    // Don't throw here, just log the error
  }
} 