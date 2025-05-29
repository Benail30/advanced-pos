-- Insert sample products
INSERT INTO products (name, description, price, stock, category, sku) VALUES
('iPhone 13', 'Latest iPhone model with A15 chip', 999.99, 50, 'Electronics', 'APPL-IP13-001'),
('MacBook Pro', '14-inch MacBook Pro with M1 Pro', 1999.99, 25, 'Electronics', 'APPL-MB14-001'),
('AirPods Pro', 'Wireless earbuds with noise cancellation', 249.99, 100, 'Electronics', 'APPL-APP2-001'),
('Coffee Maker', 'Premium coffee maker with timer', 79.99, 30, 'Home & Garden', 'HOME-COF-001'),
('Yoga Mat', 'Non-slip exercise yoga mat', 29.99, 75, 'Sports & Outdoors', 'SPRT-YOG-001'),
('Running Shoes', 'Professional running shoes', 129.99, 45, 'Sports & Outdoors', 'SPRT-SHO-001'),
('Protein Powder', 'Whey protein powder vanilla flavor', 39.99, 60, 'Health & Beauty', 'HLTH-PRO-001'),
('Face Cream', 'Anti-aging face cream', 49.99, 40, 'Health & Beauty', 'HLTH-FCR-001'),
('LED Desk Lamp', 'Adjustable LED desk lamp', 34.99, 55, 'Home & Garden', 'HOME-LED-001'),
('Gaming Mouse', 'RGB gaming mouse with programmable buttons', 59.99, 35, 'Electronics', 'TECH-MOU-001')
ON CONFLICT (sku) DO NOTHING; 