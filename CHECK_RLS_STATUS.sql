-- Check RLS Status and Policies

-- 1. Check your current user
SELECT 
  auth.uid() as user_id,
  auth.role() as user_role,
  auth.email() as user_email;

-- 2. Check existing policies on room_qr_codes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'room_qr_codes';

-- 3. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('service_categories', 'service_items', 'service_orders', 'service_order_items', 'room_qr_codes');

-- 4. Test if you can insert (this will fail if policies are wrong)
-- Uncomment to test:
/*
INSERT INTO room_qr_codes (property_id, room_id, qr_code_data, generated_at)
VALUES (1, 1, 'TEST-QR-CODE', NOW())
RETURNING *;
*/
