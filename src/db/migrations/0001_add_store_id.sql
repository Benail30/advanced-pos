-- Add store_id to users table
ALTER TABLE users ADD COLUMN store_id INTEGER;

-- Create stores table if it doesn't exist
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT fk_store
  FOREIGN KEY (store_id) REFERENCES stores(id); 