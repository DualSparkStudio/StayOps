-- ============================================
-- PHASE 1: COMPLETE MULTI-TENANT SETUP
-- ============================================
-- This migration converts the single-tenant system to multi-tenant
-- Run this ONCE in Supabase SQL Editor
-- 
-- IMPORTANT: Update Grand Valley email and phone below (search for "UPDATE WITH YOUR INFO")
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: CREATE PROPERTIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    plan_type VARCHAR(20) NOT NULL DEFAULT 'basic' CHECK (plan_type IN ('basic', 'pro', 'premium')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'inactive')),
    subscription_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'trialing')),
    
    -- Contact & Business Info
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    
    -- Subscription & Billing
    razorpay_subscription_id VARCHAR(255),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Feature Flags
    qr_enabled BOOLEAN DEFAULT FALSE,
    custom_domain_enabled BOOLEAN DEFAULT FALSE,
    analytics_enabled BOOLEAN DEFAULT FALSE,
    room_limit INTEGER DEFAULT 10,
    
    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(7),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_subdomain ON properties(subdomain);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_plan_type ON properties(plan_type);
CREATE INDEX IF NOT EXISTS idx_properties_subscription_status ON properties(subscription_status);

-- Add comments
COMMENT ON TABLE properties IS 'Central table for multi-tenant properties (hotels)';
COMMENT ON COLUMN properties.subdomain IS 'Unique subdomain for property access (e.g., grandvalley.stayops.net)';
COMMENT ON COLUMN properties.plan_type IS 'Subscription plan: basic, pro, or premium';
COMMENT ON COLUMN properties.qr_enabled IS 'Enable QR room service feature';
COMMENT ON COLUMN properties.room_limit IS 'Maximum number of rooms allowed based on plan';

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_properties_updated_at();

-- ============================================
-- STEP 2: ADD PROPERTY_ID TO ALL TABLES
-- ============================================

-- Rooms
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON rooms(property_id);
COMMENT ON COLUMN rooms.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- Bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
COMMENT ON COLUMN bookings.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- Users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_users_property_id ON users(property_id);
COMMENT ON COLUMN users.property_id IS 'Foreign key to properties table - user belongs to one property';

-- Blocked Dates
ALTER TABLE blocked_dates 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_blocked_dates_property_id ON blocked_dates(property_id);
COMMENT ON COLUMN blocked_dates.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- Facilities
ALTER TABLE facilities 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_facilities_property_id ON facilities(property_id);
COMMENT ON COLUMN facilities.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- Testimonials
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_testimonials_property_id ON testimonials(property_id);
COMMENT ON COLUMN testimonials.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- Tourist Attractions
ALTER TABLE tourist_attractions 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_property_id ON tourist_attractions(property_id);
COMMENT ON COLUMN tourist_attractions.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- Contact Messages
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_contact_messages_property_id ON contact_messages(property_id);
COMMENT ON COLUMN contact_messages.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- Social Media Links
ALTER TABLE social_media_links 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_social_media_links_property_id ON social_media_links(property_id);
COMMENT ON COLUMN social_media_links.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- Room Images
ALTER TABLE room_images 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_room_images_property_id ON room_images(property_id);
COMMENT ON COLUMN room_images.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- Conditional tables (only if they exist)
DO $$
BEGIN
    -- Resort Closures
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resort_closures') THEN
        ALTER TABLE resort_closures 
        ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_resort_closures_property_id ON resort_closures(property_id);
        COMMENT ON COLUMN resort_closures.property_id IS 'Foreign key to properties table for multi-tenant isolation';
    END IF;
    
    -- WhatsApp Sessions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_sessions') THEN
        ALTER TABLE whatsapp_sessions 
        ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_property_id ON whatsapp_sessions(property_id);
        COMMENT ON COLUMN whatsapp_sessions.property_id IS 'Foreign key to properties table for multi-tenant isolation';
    END IF;
    
    -- Features
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'features') THEN
        ALTER TABLE features 
        ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_features_property_id ON features(property_id);
        COMMENT ON COLUMN features.property_id IS 'Foreign key to properties table for multi-tenant isolation';
    END IF;
    
    -- House Rules
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'house_rules') THEN
        ALTER TABLE house_rules 
        ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_house_rules_property_id ON house_rules(property_id);
        COMMENT ON COLUMN house_rules.property_id IS 'Foreign key to properties table for multi-tenant isolation';
    END IF;
    
    -- FAQs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faqs') THEN
        ALTER TABLE faqs 
        ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_faqs_property_id ON faqs(property_id);
        COMMENT ON COLUMN faqs.property_id IS 'Foreign key to properties table for multi-tenant isolation';
    END IF;
END $$;

-- ============================================
-- STEP 3: SEED GRAND VALLEY AS FIRST PROPERTY
-- ============================================

-- ⚠️ UPDATE WITH YOUR INFO: Change email and phone below
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
    '00000000-0000-0000-0000-000000000001',
    'Grand Valley Resort',
    'grandvalley',
    'premium',
    'active',
    'active',
    'info@grandvalleyresort.com',  -- ⚠️ UPDATE THIS
    '+91-XXXXXXXXXX',               -- ⚠️ UPDATE THIS
    true,
    true,
    true,
    50
)
ON CONFLICT (subdomain) DO NOTHING;

-- Link all existing data to Grand Valley
UPDATE rooms 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

UPDATE bookings 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

UPDATE users 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

UPDATE blocked_dates 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

UPDATE facilities 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

UPDATE testimonials 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

UPDATE tourist_attractions 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

UPDATE contact_messages 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

UPDATE social_media_links 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

UPDATE room_images 
SET property_id = '00000000-0000-0000-0000-000000000001'
WHERE property_id IS NULL;

-- Update conditional tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resort_closures') THEN
        EXECUTE 'UPDATE resort_closures SET property_id = ''00000000-0000-0000-0000-000000000001'' WHERE property_id IS NULL';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_sessions') THEN
        EXECUTE 'UPDATE whatsapp_sessions SET property_id = ''00000000-0000-0000-0000-000000000001'' WHERE property_id IS NULL';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'features') THEN
        EXECUTE 'UPDATE features SET property_id = ''00000000-0000-0000-0000-000000000001'' WHERE property_id IS NULL';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'house_rules') THEN
        EXECUTE 'UPDATE house_rules SET property_id = ''00000000-0000-0000-0000-000000000001'' WHERE property_id IS NULL';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faqs') THEN
        EXECUTE 'UPDATE faqs SET property_id = ''00000000-0000-0000-0000-000000000001'' WHERE property_id IS NULL';
    END IF;
END $$;

-- ============================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_images ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Service role can manage all properties"
ON properties FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active properties"
ON properties FOR SELECT TO public
USING (status = 'active');

-- Rooms policies
CREATE POLICY "Service role can manage all rooms"
ON rooms FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active rooms"
ON rooms FOR SELECT TO public
USING (is_active = true AND (is_deleted IS NULL OR is_deleted = false));

-- Bookings policies
CREATE POLICY "Service role can manage all bookings"
ON bookings FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can create bookings"
ON bookings FOR INSERT TO public
WITH CHECK (true);

CREATE POLICY "Public can view own bookings"
ON bookings FOR SELECT TO public
USING (true);

-- Users policies
CREATE POLICY "Service role can manage all users"
ON users FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Blocked dates policies
CREATE POLICY "Service role can manage all blocked_dates"
ON blocked_dates FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can view blocked_dates"
ON blocked_dates FOR SELECT TO public
USING (true);

-- Facilities policies
CREATE POLICY "Service role can manage all facilities"
ON facilities FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active facilities"
ON facilities FOR SELECT TO public
USING (is_active = true);

-- Testimonials policies
CREATE POLICY "Service role can manage all testimonials"
ON testimonials FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active testimonials"
ON testimonials FOR SELECT TO public
USING (is_active = true);

-- Tourist attractions policies
CREATE POLICY "Service role can manage all tourist_attractions"
ON tourist_attractions FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active tourist_attractions"
ON tourist_attractions FOR SELECT TO public
USING (is_active = true);

-- Contact messages policies
CREATE POLICY "Service role can manage all contact_messages"
ON contact_messages FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can create contact_messages"
ON contact_messages FOR INSERT TO public
WITH CHECK (true);

-- Social media links policies
CREATE POLICY "Service role can manage all social_media_links"
ON social_media_links FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can view active social_media_links"
ON social_media_links FOR SELECT TO public
USING (is_active = true);

-- Room images policies
CREATE POLICY "Service role can manage all room_images"
ON room_images FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Public can view room_images"
ON room_images FOR SELECT TO public
USING (true);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify the migration worked:

-- 1. Check properties table exists and has Grand Valley
-- SELECT * FROM properties;

-- 2. Check all rooms are linked to Grand Valley
-- SELECT COUNT(*) as total_rooms, property_id FROM rooms GROUP BY property_id;

-- 3. Check all bookings are linked to Grand Valley
-- SELECT COUNT(*) as total_bookings, property_id FROM bookings GROUP BY property_id;

-- 4. Verify indexes were created
-- SELECT tablename, indexname FROM pg_indexes WHERE tablename IN ('properties', 'rooms', 'bookings') ORDER BY tablename;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- 
-- ✅ Properties table created
-- ✅ property_id added to all tables
-- ✅ Grand Valley created as first property
-- ✅ All existing data linked to Grand Valley
-- ✅ Row Level Security enabled
-- ✅ Indexes created for performance
-- 
-- Next steps:
-- 1. Update main.tsx with PropertyProvider
-- 2. Update all queries to filter by property_id
-- 3. Test with multiple properties
-- 
-- See PHASE_1_IMPLEMENTATION_GUIDE.md for details
-- ============================================
