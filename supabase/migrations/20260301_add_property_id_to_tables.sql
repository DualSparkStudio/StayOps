-- ============================================
-- PHASE 1: Multi-Tenant Core - Add property_id to All Tables
-- ============================================
-- This migration adds property_id foreign key to all core tables
-- to enable multi-tenant data isolation

-- ============================================
-- 1. Add property_id to ROOMS table
-- ============================================
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON rooms(property_id);

COMMENT ON COLUMN rooms.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- ============================================
-- 2. Add property_id to BOOKINGS table
-- ============================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);

COMMENT ON COLUMN bookings.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- ============================================
-- 3. Add property_id to USERS table
-- ============================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_users_property_id ON users(property_id);

COMMENT ON COLUMN users.property_id IS 'Foreign key to properties table - user belongs to one property';

-- ============================================
-- 4. Add property_id to BLOCKED_DATES table
-- ============================================
ALTER TABLE blocked_dates 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_blocked_dates_property_id ON blocked_dates(property_id);

COMMENT ON COLUMN blocked_dates.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- ============================================
-- 5. Add property_id to FACILITIES table
-- ============================================
ALTER TABLE facilities 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_facilities_property_id ON facilities(property_id);

COMMENT ON COLUMN facilities.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- ============================================
-- 6. Add property_id to TESTIMONIALS table
-- ============================================
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_testimonials_property_id ON testimonials(property_id);

COMMENT ON COLUMN testimonials.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- ============================================
-- 7. Add property_id to TOURIST_ATTRACTIONS table
-- ============================================
ALTER TABLE tourist_attractions 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tourist_attractions_property_id ON tourist_attractions(property_id);

COMMENT ON COLUMN tourist_attractions.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- ============================================
-- 8. Add property_id to CONTACT_MESSAGES table
-- ============================================
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_contact_messages_property_id ON contact_messages(property_id);

COMMENT ON COLUMN contact_messages.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- ============================================
-- 9. Add property_id to SOCIAL_MEDIA_LINKS table
-- ============================================
ALTER TABLE social_media_links 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_social_media_links_property_id ON social_media_links(property_id);

COMMENT ON COLUMN social_media_links.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- ============================================
-- 10. Add property_id to ROOM_IMAGES table
-- ============================================
ALTER TABLE room_images 
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_room_images_property_id ON room_images(property_id);

COMMENT ON COLUMN room_images.property_id IS 'Foreign key to properties table for multi-tenant isolation';

-- ============================================
-- 11. Add property_id to RESORT_CLOSURES table (if exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resort_closures') THEN
        ALTER TABLE resort_closures 
        ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_resort_closures_property_id ON resort_closures(property_id);
        
        COMMENT ON COLUMN resort_closures.property_id IS 'Foreign key to properties table for multi-tenant isolation';
    END IF;
END $$;

-- ============================================
-- 12. Add property_id to WHATSAPP_SESSIONS table (if exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_sessions') THEN
        ALTER TABLE whatsapp_sessions 
        ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_property_id ON whatsapp_sessions(property_id);
        
        COMMENT ON COLUMN whatsapp_sessions.property_id IS 'Foreign key to properties table for multi-tenant isolation';
    END IF;
END $$;

-- ============================================
-- Note: WHATSAPP_MESSAGES inherits property_id through session relationship
-- Note: CALENDAR_SETTINGS might be global or property-specific (decide later)
-- ============================================
