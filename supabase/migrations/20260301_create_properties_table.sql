-- ============================================
-- PHASE 1: Multi-Tenant Core - Create Properties Table
-- ============================================
-- This migration creates the central properties table that represents
-- each hotel/property in the multi-tenant SaaS system

-- Create properties table
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
    
    -- Feature Flags (for Phase 4)
    qr_enabled BOOLEAN DEFAULT FALSE,
    custom_domain_enabled BOOLEAN DEFAULT FALSE,
    analytics_enabled BOOLEAN DEFAULT FALSE,
    room_limit INTEGER DEFAULT 10,
    
    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(7), -- Hex color code
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_subdomain ON properties(subdomain);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_plan_type ON properties(plan_type);
CREATE INDEX IF NOT EXISTS idx_properties_subscription_status ON properties(subscription_status);

-- Add comments for documentation
COMMENT ON TABLE properties IS 'Central table for multi-tenant properties (hotels)';
COMMENT ON COLUMN properties.subdomain IS 'Unique subdomain for property access (e.g., grandvalley.stayops.net)';
COMMENT ON COLUMN properties.plan_type IS 'Subscription plan: basic, pro, or premium';
COMMENT ON COLUMN properties.status IS 'Property operational status';
COMMENT ON COLUMN properties.subscription_status IS 'Razorpay subscription status';
COMMENT ON COLUMN properties.qr_enabled IS 'Enable QR room service feature';
COMMENT ON COLUMN properties.room_limit IS 'Maximum number of rooms allowed based on plan';

-- Create trigger to update updated_at timestamp
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
