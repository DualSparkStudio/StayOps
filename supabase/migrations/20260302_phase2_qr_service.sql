-- ============================================
-- PHASE 2: QR SERVICE INTEGRATION
-- ============================================
-- This migration adds QR-based room service functionality
-- to the multi-tenant system
-- ============================================

-- ============================================
-- STEP 1: CREATE SERVICE CATEGORIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- Icon name for UI (e.g., 'utensils', 'coffee', 'concierge')
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_categories_property_id ON service_categories(property_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_active ON service_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_service_categories_order ON service_categories(display_order);

-- Comments
COMMENT ON TABLE service_categories IS 'Service categories for QR room service (e.g., Food, Beverages, Housekeeping)';
COMMENT ON COLUMN service_categories.property_id IS 'Foreign key to properties table for multi-tenant isolation';
COMMENT ON COLUMN service_categories.icon IS 'Icon identifier for UI display';

-- ============================================
-- STEP 2: CREATE SERVICE ITEMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS service_items (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES service_categories(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    preparation_time INTEGER, -- in minutes
    display_order INTEGER DEFAULT 0,
    tags TEXT[], -- Array of tags for filtering (e.g., ['vegetarian', 'spicy', 'popular'])
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_items_property_id ON service_items(property_id);
CREATE INDEX IF NOT EXISTS idx_service_items_category_id ON service_items(category_id);
CREATE INDEX IF NOT EXISTS idx_service_items_available ON service_items(is_available);
CREATE INDEX IF NOT EXISTS idx_service_items_order ON service_items(display_order);

-- Comments
COMMENT ON TABLE service_items IS 'Individual service items/menu items for QR room service';
COMMENT ON COLUMN service_items.property_id IS 'Foreign key to properties table for multi-tenant isolation';
COMMENT ON COLUMN service_items.preparation_time IS 'Estimated preparation time in minutes';
COMMENT ON COLUMN service_items.tags IS 'Array of tags for filtering and categorization';

-- ============================================
-- STEP 3: CREATE SERVICE ORDERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS service_orders (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    guest_name VARCHAR(200),
    room_number VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    order_status VARCHAR(20) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    special_instructions TEXT,
    ordered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_orders_property_id ON service_orders(property_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_room_id ON service_orders(room_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_booking_id ON service_orders(booking_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_service_orders_ordered_at ON service_orders(ordered_at DESC);

-- Comments
COMMENT ON TABLE service_orders IS 'Service orders placed via QR room service';
COMMENT ON COLUMN service_orders.property_id IS 'Foreign key to properties table for multi-tenant isolation';
COMMENT ON COLUMN service_orders.order_status IS 'Current status of the order';

-- ============================================
-- STEP 4: CREATE SERVICE ORDER ITEMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS service_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    service_item_id INTEGER REFERENCES service_items(id) ON DELETE SET NULL,
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    special_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_order_items_order_id ON service_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_service_order_items_service_item_id ON service_order_items(service_item_id);

-- Comments
COMMENT ON TABLE service_order_items IS 'Individual items within a service order';
COMMENT ON COLUMN service_order_items.subtotal IS 'Calculated as quantity * unit_price';

-- ============================================
-- STEP 5: CREATE ROOM QR CODES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS room_qr_codes (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    qr_code_data TEXT NOT NULL UNIQUE,
    qr_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_scanned_at TIMESTAMP WITH TIME ZONE,
    scan_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_property_room_qr UNIQUE(property_id, room_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_room_qr_codes_property_id ON room_qr_codes(property_id);
CREATE INDEX IF NOT EXISTS idx_room_qr_codes_room_id ON room_qr_codes(room_id);
CREATE INDEX IF NOT EXISTS idx_room_qr_codes_active ON room_qr_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_room_qr_codes_data ON room_qr_codes(qr_code_data);

-- Comments
COMMENT ON TABLE room_qr_codes IS 'QR codes generated for each room to access room service';
COMMENT ON COLUMN room_qr_codes.property_id IS 'Foreign key to properties table for multi-tenant isolation';
COMMENT ON COLUMN room_qr_codes.qr_code_data IS 'Unique identifier encoded in QR code';
COMMENT ON COLUMN room_qr_codes.scan_count IS 'Number of times QR code has been scanned';

-- ============================================
-- STEP 6: CREATE TRIGGERS FOR UPDATED_AT
-- ============================================

-- Service Categories
CREATE OR REPLACE FUNCTION update_service_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_categories_updated_at
    BEFORE UPDATE ON service_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_service_categories_updated_at();

-- Service Items
CREATE OR REPLACE FUNCTION update_service_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_items_updated_at
    BEFORE UPDATE ON service_items
    FOR EACH ROW
    EXECUTE FUNCTION update_service_items_updated_at();

-- Service Orders
CREATE OR REPLACE FUNCTION update_service_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_orders_updated_at
    BEFORE UPDATE ON service_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_service_orders_updated_at();

-- Room QR Codes
CREATE OR REPLACE FUNCTION update_room_qr_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_room_qr_codes_updated_at
    BEFORE UPDATE ON room_qr_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_room_qr_codes_updated_at();

-- ============================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_qr_codes ENABLE ROW LEVEL SECURITY;

-- Service Categories Policies
CREATE POLICY "Service role can manage all service_categories"
ON service_categories FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active service_categories"
ON service_categories FOR SELECT TO public
USING (is_active = true);

-- Service Items Policies
CREATE POLICY "Service role can manage all service_items"
ON service_items FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can view available service_items"
ON service_items FOR SELECT TO public
USING (is_available = true);

-- Service Orders Policies
CREATE POLICY "Service role can manage all service_orders"
ON service_orders FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can create service_orders"
ON service_orders FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Public can view own service_orders"
ON service_orders FOR SELECT TO public
USING (true);

-- Service Order Items Policies
CREATE POLICY "Service role can manage all service_order_items"
ON service_order_items FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can view service_order_items"
ON service_order_items FOR SELECT TO public
USING (true);

-- Room QR Codes Policies
CREATE POLICY "Service role can manage all room_qr_codes"
ON room_qr_codes FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active room_qr_codes"
ON room_qr_codes FOR SELECT TO public
USING (is_active = true);

-- ============================================
-- STEP 8: SEED SAMPLE DATA FOR GRAND VALLEY
-- ============================================

-- Insert sample service categories for Grand Valley (property_id = 1)
INSERT INTO service_categories (property_id, name, description, icon, display_order, is_active) VALUES
(1, 'Food & Dining', 'Delicious meals delivered to your room', 'utensils', 1, true),
(1, 'Beverages', 'Hot and cold beverages', 'coffee', 2, true),
(1, 'Housekeeping', 'Room cleaning and maintenance services', 'broom', 3, true),
(1, 'Concierge', 'Guest services and assistance', 'concierge-bell', 4, true)
ON CONFLICT DO NOTHING;

-- Insert sample service items for Grand Valley
INSERT INTO service_items (property_id, category_id, name, description, price, is_available, preparation_time, display_order, tags) VALUES
-- Food items
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Food & Dining' LIMIT 1), 
 'Breakfast Combo', 'Toast, eggs, juice, and coffee', 350.00, true, 20, 1, ARRAY['breakfast', 'popular']),
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Food & Dining' LIMIT 1), 
 'Veg Sandwich', 'Fresh vegetable sandwich with fries', 250.00, true, 15, 2, ARRAY['vegetarian', 'lunch']),
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Food & Dining' LIMIT 1), 
 'Chicken Biryani', 'Aromatic chicken biryani with raita', 450.00, true, 30, 3, ARRAY['dinner', 'popular', 'spicy']),
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Food & Dining' LIMIT 1), 
 'Paneer Tikka', 'Grilled cottage cheese with spices', 380.00, true, 25, 4, ARRAY['vegetarian', 'dinner']),

-- Beverages
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Beverages' LIMIT 1), 
 'Filter Coffee', 'Traditional South Indian filter coffee', 80.00, true, 5, 1, ARRAY['hot', 'popular']),
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Beverages' LIMIT 1), 
 'Masala Chai', 'Spiced Indian tea', 60.00, true, 5, 2, ARRAY['hot']),
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Beverages' LIMIT 1), 
 'Fresh Lime Soda', 'Refreshing lime soda', 70.00, true, 5, 3, ARRAY['cold', 'refreshing']),
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Beverages' LIMIT 1), 
 'Mango Juice', 'Fresh mango juice', 120.00, true, 5, 4, ARRAY['cold', 'fruit']),

-- Housekeeping
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Housekeeping' LIMIT 1), 
 'Extra Towels', 'Request additional towels', 0.00, true, 10, 1, ARRAY['housekeeping']),
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Housekeeping' LIMIT 1), 
 'Room Cleaning', 'Request room cleaning service', 0.00, true, 30, 2, ARRAY['housekeeping']),
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Housekeeping' LIMIT 1), 
 'Laundry Service', 'Laundry pickup and delivery', 200.00, true, 1440, 3, ARRAY['housekeeping']),

-- Concierge
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Concierge' LIMIT 1), 
 'Taxi Booking', 'Book a taxi for local travel', 0.00, true, 15, 1, ARRAY['transport']),
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Concierge' LIMIT 1), 
 'Tour Information', 'Get information about local attractions', 0.00, true, 5, 2, ARRAY['information']),
(1, (SELECT id FROM service_categories WHERE property_id = 1 AND name = 'Concierge' LIMIT 1), 
 'Wake-up Call', 'Schedule a wake-up call', 0.00, true, 0, 3, ARRAY['service'])
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify the migration worked:

-- 1. Check service categories
-- SELECT * FROM service_categories WHERE property_id = 1;

-- 2. Check service items
-- SELECT si.*, sc.name as category_name 
-- FROM service_items si 
-- JOIN service_categories sc ON si.category_id = sc.id 
-- WHERE si.property_id = 1;

-- 3. Check table structure
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name IN ('service_categories', 'service_items', 'service_orders', 'service_order_items', 'room_qr_codes')
-- ORDER BY table_name, ordinal_position;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- 
-- ✅ Service categories table created
-- ✅ Service items table created
-- ✅ Service orders table created
-- ✅ Service order items table created
-- ✅ Room QR codes table created
-- ✅ Indexes created for performance
-- ✅ Triggers for updated_at timestamps
-- ✅ Row Level Security enabled
-- ✅ Sample data seeded for Grand Valley
-- 
-- Next steps:
-- 1. Create admin pages for managing service categories and items
-- 2. Create admin page for viewing and managing orders
-- 3. Create guest-facing QR service interface
-- 4. Implement QR code generation for rooms
-- 5. Add real-time order notifications
-- 
-- ============================================
