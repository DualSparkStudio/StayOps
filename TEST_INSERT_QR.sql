-- Test if authenticated users can insert into room_qr_codes
-- Run this while logged into your app as an admin

-- First, check if you're authenticated
SELECT 
  auth.uid() as user_id,
  auth.role() as user_role;

-- If the above shows a user_id, try this insert:
INSERT INTO room_qr_codes (property_id, room_id, qr_code_data, generated_at)
VALUES (1, 1, 'TEST-QR-' || gen_random_uuid()::text, NOW())
RETURNING *;

-- If it works, delete the test:
-- DELETE FROM room_qr_codes WHERE qr_code_data LIKE 'TEST-QR-%';
