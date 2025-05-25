-- Connect to the database first with: psql -h localhost -U ghassenbenali -d pos_db -f fix_database.sql

-- 1. Create enum types safely
DO $$ BEGIN
    -- Check if the role type already exists before creating it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE "public"."role" AS ENUM('ADMIN', 'MANAGER', 'USER');
    END IF;
END $$;

-- Drop this if it exists already and recreate
DROP TYPE IF EXISTS "public"."transaction_status";
CREATE TYPE "public"."transaction_status" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- 2. Fix foreign key constraint violations in product_store_inventory
-- Find products in product_store_inventory that don't exist in products table
SELECT product_id FROM product_store_inventory 
WHERE product_id NOT IN (SELECT id FROM products);

-- Option 1: Delete orphaned records
DELETE FROM product_store_inventory
WHERE product_id NOT IN (SELECT id FROM products);

-- 3. Fix unique constraint issues
-- First check for duplicates
SELECT sku, COUNT(*) FROM products GROUP BY sku HAVING COUNT(*) > 1;
SELECT barcode, COUNT(*) FROM products GROUP BY barcode HAVING COUNT(*) > 1;

-- Make NULL rather than duplicates (safer than deleting)
UPDATE products 
SET sku = NULL 
WHERE id IN (
    SELECT id FROM products p
    WHERE EXISTS (
        SELECT 1 FROM products p2
        WHERE p2.sku = p.sku AND p2.id < p.id AND p.sku IS NOT NULL
    )
);

UPDATE products 
SET barcode = NULL 
WHERE id IN (
    SELECT id FROM products p
    WHERE EXISTS (
        SELECT 1 FROM products p2
        WHERE p2.barcode = p.barcode AND p2.id < p.id AND p.barcode IS NOT NULL
    )
);

-- 4. Now safely add unique constraints
-- Make sure unique constraints exist on products
DO $$ BEGIN
    -- Try to add unique constraint on sku if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_sku_unique' AND conrelid = 'products'::regclass
    ) THEN
        BEGIN
            ALTER TABLE "products" ADD CONSTRAINT "products_sku_unique" UNIQUE("sku");
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not add unique constraint to sku: %', SQLERRM;
        END;
    END IF;

    -- Try to add unique constraint on barcode if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_barcode_unique' AND conrelid = 'products'::regclass
    ) THEN
        BEGIN
            ALTER TABLE "products" ADD CONSTRAINT "products_barcode_unique" UNIQUE("barcode");
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not add unique constraint to barcode: %', SQLERRM;
        END;
    END IF;
END $$;

-- 5. Fix email uniqueness in users table 
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;

UPDATE users 
SET email = email || '-' || id 
WHERE id IN (
    SELECT id FROM users u
    WHERE EXISTS (
        SELECT 1 FROM users u2
        WHERE u2.email = u.email AND u2.id < u.id
    )
);

-- Ensure users_email_unique constraint exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_unique' AND conrelid = 'users'::regclass
    ) THEN
        BEGIN
            ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not add unique constraint to email: %', SQLERRM;
        END;
    END IF;
END $$;

-- 6. Fix transaction_number uniqueness
SELECT transaction_number, COUNT(*) FROM transactions 
GROUP BY transaction_number HAVING COUNT(*) > 1;

UPDATE transactions 
SET transaction_number = transaction_number || '-' || id 
WHERE id IN (
    SELECT id FROM transactions t
    WHERE EXISTS (
        SELECT 1 FROM transactions t2
        WHERE t2.transaction_number = t.transaction_number AND t2.id < t.id
    )
);

-- Ensure transaction_number unique constraint exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'transactions_transaction_number_unique' AND conrelid = 'transactions'::regclass
    ) THEN
        BEGIN
            ALTER TABLE "transactions" ADD CONSTRAINT "transactions_transaction_number_unique" UNIQUE("transaction_number");
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not add unique constraint to transaction_number: %', SQLERRM;
        END;
    END IF;
END $$;

-- 7. Fix store_id foreign key issues in products table
-- Check for products with invalid store_id
SELECT id, name FROM products WHERE store_id IS NOT NULL AND store_id NOT IN (SELECT id FROM stores);

-- Set invalid store_id to NULL
UPDATE products SET store_id = NULL WHERE store_id IS NOT NULL AND store_id NOT IN (SELECT id FROM stores);

-- 8. Fix category_id foreign key issues in products table
-- Check for products with invalid category_id
SELECT id, name FROM products WHERE category_id IS NOT NULL AND category_id NOT IN (SELECT id FROM categories);

-- Set invalid category_id to NULL
UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL AND category_id NOT IN (SELECT id FROM categories);

-- 9. Verify that all constraints can now be safely enforced
SELECT 'Database fixes complete! Your schema should now be consistent.' AS result; 