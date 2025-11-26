-- Sample data for testing (optional)
-- Run this after creating the tables

-- Insert sample suppliers
INSERT INTO suppliers (name, email, address, contact_person, contact_number)
VALUES 
    ('Acme Corporation', 'contact@acme.com', '123 Main Street, City, State 12345', 'John Smith', '555-0100'),
    ('Global Supplies Inc', 'info@globalsupplies.com', '456 Business Ave, City, State 12346', 'Jane Doe', '555-0200'),
    ('Tech Distributors', 'sales@techdist.com', '789 Tech Park, City, State 12347', 'Bob Johnson', '555-0300')
ON CONFLICT DO NOTHING;

-- Insert sample users
INSERT INTO users (username, email, full_name, role)
VALUES 
    ('admin', 'admin@inventorymaster.com', 'Administrator', 'admin'),
    ('manager', 'manager@inventorymaster.com', 'Manager User', 'manager'),
    ('user1', 'user1@inventorymaster.com', 'Regular User', 'user')
ON CONFLICT DO NOTHING;

-- Insert sample products (using supplier IDs from above)
-- Note: Adjust supplier_id values based on actual IDs from suppliers table
INSERT INTO products (id, name, sku, quantity, price, supplier_id, category, min_stock_level, created_at)
VALUES 
    (1, 'Laptop Computer', 'LAP-001', 50, 999.99, 1, 'Electronics', 10, CURRENT_DATE),
    (2, 'Wireless Mouse', 'MOU-001', 200, 29.99, 1, 'Electronics', 25, CURRENT_DATE),
    (3, 'USB-C Cable', 'CAB-001', 500, 19.99, 2, 'Accessories', 50, CURRENT_DATE),
    (4, 'Monitor 27"', 'MON-001', 30, 299.99, 2, 'Electronics', 5, CURRENT_DATE),
    (5, 'Keyboard Mechanical', 'KEY-001', 75, 89.99, 3, 'Accessories', 15, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- Insert sample transactions
-- Note: Adjust product_id and user_id values based on actual IDs
INSERT INTO transactions (id, product_id, quantity_sold, date, total, user_id)
VALUES 
    ('TXN-001', 1, 2, CURRENT_DATE, 1999.98, 1),
    ('TXN-002', 2, 5, CURRENT_DATE - INTERVAL '1 day', 149.95, 2),
    ('TXN-003', 3, 10, CURRENT_DATE - INTERVAL '2 days', 199.90, 3),
    ('TXN-004', 4, 1, CURRENT_DATE - INTERVAL '3 days', 299.99, 1),
    ('TXN-005', 5, 3, CURRENT_DATE - INTERVAL '4 days', 269.97, 2)
ON CONFLICT (id) DO NOTHING;

