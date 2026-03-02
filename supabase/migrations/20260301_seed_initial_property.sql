-- ============================================
-- PHASE 1: Seed Initial Property (Grand Valley)
-- ============================================
-- This migration creates the first property record for your existing hotel
-- and associates all existing data with it

-- Insert Grand Valley as the first property
INSERT INTO properties (
    id,
    name,
    subdomain,
    plan_type,
    status,
    subscription_status,
    email,
    phone,
    qr_enabled,
    custom_domain_enabled,
    analytics_enabled,
    room_limit
) VALUES (
    '00000000-0000-0000-0000-000000000001', -- Fixed UUID for easy reference
    'Grand Valley Resort',
    'grandvalley',
    'premium', -- Start with premium for existing hotel
    'active',
    'active',
    'info@grandvalleyresort.com', -- Update with actual email
    '+91-XXXXXXXXXX', -- Update with actual phone
    true, -- Enable QR service
    true, -- Enable custom domain
    true, -- Enable analytics
    50 -- Allow up to 50 rooms
)
ON CONFLICT (subdomain) DO NOTHING;

-- Update all existing rooms to belong to Grand Valley
UPDATE rooms 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

-- Update all existing bookings to belong to Grand Valley
UPDATE bookings 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

-- Update all existing users to belong to Grand Valley
UPDATE users 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

-- Update all existing blocked_dates to belong to Grand Valley
UPDATE blocked_dates 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

-- Update all existing facilities to belong to Grand Valley
UPDATE facilities 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

-- Update all existing testimonials to belong to Grand Valley
UPDATE testimonials 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

-- Update all existing tourist_attractions to belong to Grand Valley
UPDATE tourist_attractions 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

-- Update all existing contact_messages to belong to Grand Valley
UPDATE contact_messages 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

-- Update all existing social_media_links to belong to Grand Valley
UPDATE social_media_links 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

-- Update all existing room_images to belong to Grand Valley
UPDATE room_images 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

-- Update conditional tables if they exist
DO $$
BEGIN
    -- Update resort_closures if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resort_closures') THEN
        EXECUTE 'UPDATE resort_closures SET property_id = ''00000000-0000-0000-0000-000000000001'' WHERE property_id IS NULL';
    END IF;
    
    -- Update whatsapp_sessions if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_sessions') THEN
        EXECUTE 'UPDATE whatsapp_sessions SET property_id = ''00000000-0000-0000-0000-000000000001'' WHERE property_id IS NULL';
    END IF;
    
    -- Update features if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'features') THEN
        EXECUTE 'UPDATE features SET property_id = ''00000000-0000-0000-0000-000000000001'' WHERE property_id IS NULL';
    END IF;
    
    -- Update house_rules if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'house_rules') THEN
        EXECUTE 'UPDATE house_rules SET property_id = ''00000000-0000-0000-0000-000000000001'' WHERE property_id IS NULL';
    END IF;
    
    -- Update faqs if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faqs') THEN
        EXECUTE 'UPDATE faqs SET property_id = ''00000000-0000-0000-0000-000000000001'' WHERE property_id IS NULL';
    END IF;
END $$;

-- Add a comment
COMMENT ON TABLE properties IS 'Multi-tenant properties table - Grand Valley is the first property with ID 00000000-0000-0000-0000-000000000001';
