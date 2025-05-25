DO $$ BEGIN
    -- Check if the role type already exists before creating it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE "public"."role" AS ENUM('ADMIN', 'MANAGER', 'USER');
    END IF;
END $$;

-- Drop this if it exists already and recreate
DROP TYPE IF EXISTS "public"."transaction_status";
CREATE TYPE "public"."transaction_status" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- Create any missing foreign keys and ensure unique constraints
-- Normally these would be run based on missing constraints, but we're doing a safe approach

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