-- Add missing tables and update existing ones

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    tax_id VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    image_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create product_store_inventory table
CREATE TABLE IF NOT EXISTS product_store_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id INTEGER REFERENCES products(id),
    store_id UUID REFERENCES stores(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    location VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, store_id)
);

-- Create stock_history table
CREATE TABLE IF NOT EXISTS stock_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id),
    product_id INTEGER REFERENCES products(id),
    quantity_change INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('purchase', 'sale', 'return', 'adjustment', 'transfer')),
    reference_id UUID,
    notes TEXT,
    user_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS min_stock_level INTEGER NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,3),
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(50),
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id),
ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_store_inventory_product ON product_store_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_product_store_inventory_store ON product_store_inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_product ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_store ON stock_history(store_id);
CREATE INDEX IF NOT EXISTS idx_transactions_store ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_store_inventory_updated_at
    BEFORE UPDATE ON product_store_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 