# Phase 2 QR Service - RLS Policy Fix

## Problem
Getting error: "new row violates row-level security policy for table room_qr_codes"

This happens because the Phase 2 migration only created RLS policies for `service_role` and `public`, but not for `authenticated` users (admins).

## Solution

Run this SQL in Supabase SQL Editor:

```sql
-- Add authenticated user policies for QR Service tables

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
```

## Alternative: Run the Fix File

You can also run the file `FIX_QR_RLS.sql` in Supabase SQL Editor.

## After Running

1. Refresh your browser
2. Try generating QR codes again
3. All QR service features should now work

## What This Does

These policies allow any authenticated (logged in) user to:
- Create, read, update, and delete service categories
- Create, read, update, and delete service items
- Create, read, update, and delete service orders
- Create, read, update, and delete order items
- Create, read, update, and delete room QR codes

For production, you may want to add more restrictive policies based on user roles (admin vs regular user).
