-- Check all policies on QR service tables

SELECT 
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('room_qr_codes', 'service_categories', 'service_items', 'service_orders', 'service_order_items')
ORDER BY tablename, policyname;
