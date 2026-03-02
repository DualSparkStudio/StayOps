-- ============================================
-- PHASE 1: Multi-Tenant Core - Add property_id to Features & FAQs
-- ============================================
-- These tables might exist based on your admin panels

-- ============================================
-- Add property_id to FEATURES table (if exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'features') THEN
        ALTER TABLE features 
        ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_features_property_id ON features(property_id);
        
        COMMENT ON COLUMN features.property_id IS 'Foreign key to properties table for multi-tenant isolation';
    END IF;
END $$;

-- ============================================
-- Add property_id to HOUSE_RULES table (if exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'house_rules') THEN
        ALTER TABLE house_rules 
        ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_house_rules_property_id ON house_rules(property_id);
        
        COMMENT ON COLUMN house_rules.property_id IS 'Foreign key to properties table for multi-tenant isolation';
    END IF;
END $$;

-- ============================================
-- Add property_id to FAQS table (if exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faqs') THEN
        ALTER TABLE faqs 
        ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_faqs_property_id ON faqs(property_id);
        
        COMMENT ON COLUMN faqs.property_id IS 'Foreign key to properties table for multi-tenant isolation';
    END IF;
END $$;
