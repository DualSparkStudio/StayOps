-- QUICK FIX: Add authenticated user policies for QR Service tables
-- Run this in Supabase SQL Editor

-- Service Categories
CREATE POLICY "Authenticated users can manage service_categories"
ON service_categories FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Service Items
CREATE POLICY "Authenticated users can manage service_items"
ON service_items FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Service Orders
CREATE POLICY "Authenticated users can manage service_orders"
ON service_orders FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Service Order Items
CREATE POLICY "Authenticated users can manage service_order_items"
ON service_order_items FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Room QR Codes
CREATE POLICY "Authenticated users can manage room_qr_codes"
ON room_qr_codes FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
