-- Fix RLS Policies for Phase 2 QR Service Tables
-- This adds missing policies for authenticated users (admins)

-- ============================================
-- SERVICE CATEGORIES - Add authenticated user policies
-- ============================================

CREATE POLICY "Authenticated users can manage service_categories for their property"
ON service_categories FOR ALL TO authenticated
USING (
  property_id IN (
    SELECT id FROM properties 
    WHERE id = (current_setting('app.current_property_id', true))::integer
  )
)
WITH CHECK (
  property_id IN (
    SELECT id FROM properties 
    WHERE id = (current_setting('app.current_property_id', true))::integer
  )
);

-- ============================================
-- SERVICE ITEMS - Add authenticated user policies
-- ============================================

CREATE POLICY "Authenticated users can manage service_items for their property"
ON service_items FOR ALL TO authenticated
USING (
  property_id IN (
    SELECT id FROM properties 
    WHERE id = (current_setting('app.current_property_id', true))::integer
  )
)
WITH CHECK (
  property_id IN (
    SELECT id FROM properties 
    WHERE id = (current_setting('app.current_property_id', true))::integer
  )
);

-- ============================================
-- SERVICE ORDERS - Add authenticated user policies
-- ============================================

CREATE POLICY "Authenticated users can manage service_orders for their property"
ON service_orders FOR ALL TO authenticated
USING (
  property_id IN (
    SELECT id FROM properties 
    WHERE id = (current_setting('app.current_property_id', true))::integer
  )
)
WITH CHECK (
  property_id IN (
    SELECT id FROM properties 
    WHERE id = (current_setting('app.current_property_id', true))::integer
  )
);

-- ============================================
-- SERVICE ORDER ITEMS - Add authenticated user policies
-- ============================================

CREATE POLICY "Authenticated users can manage service_order_items"
ON service_order_items FOR ALL TO authenticated
USING (
  order_id IN (
    SELECT id FROM service_orders 
    WHERE property_id = (current_setting('app.current_property_id', true))::integer
  )
)
WITH CHECK (
  order_id IN (
    SELECT id FROM service_orders 
    WHERE property_id = (current_setting('app.current_property_id', true))::integer
  )
);

-- ============================================
-- ROOM QR CODES - Add authenticated user policies
-- ============================================

CREATE POLICY "Authenticated users can manage room_qr_codes for their property"
ON room_qr_codes FOR ALL TO authenticated
USING (
  property_id IN (
    SELECT id FROM properties 
    WHERE id = (current_setting('app.current_property_id', true))::integer
  )
)
WITH CHECK (
  property_id IN (
    SELECT id FROM properties 
    WHERE id = (current_setting('app.current_property_id', true))::integer
  )
);

-- ============================================
-- ALTERNATIVE: Simpler policies (if property context not working)
-- Drop the above and use these instead
-- ============================================

-- Uncomment these if the above policies don't work:

/*
-- Service Categories
DROP POLICY IF EXISTS "Authenticated users can manage service_categories for their property" ON service_categories;
CREATE POLICY "Authenticated users can manage service_categories"
ON service_categories FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Service Items
DROP POLICY IF EXISTS "Authenticated users can manage service_items for their property" ON service_items;
CREATE POLICY "Authenticated users can manage service_items"
ON service_items FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Service Orders
DROP POLICY IF EXISTS "Authenticated users can manage service_orders for their property" ON service_orders;
CREATE POLICY "Authenticated users can manage service_orders"
ON service_orders FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Service Order Items
DROP POLICY IF EXISTS "Authenticated users can manage service_order_items" ON service_order_items;
CREATE POLICY "Authenticated users can manage service_order_items"
ON service_order_items FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Room QR Codes
DROP POLICY IF EXISTS "Authenticated users can manage room_qr_codes for their property" ON room_qr_codes;
CREATE POLICY "Authenticated users can manage room_qr_codes"
ON room_qr_codes FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
*/
