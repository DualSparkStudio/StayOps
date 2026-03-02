-- QUICK FIX: Disable RLS on QR Service tables
-- This allows your custom auth system to work
-- WARNING: This is less secure - only use in development or if you have other security measures

ALTER TABLE service_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE room_qr_codes DISABLE ROW LEVEL SECURITY;

-- Note: You can re-enable later with:
-- ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
