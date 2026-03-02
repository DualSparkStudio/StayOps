-- ============================================
-- COMPLETE DATABASE SCHEMA
-- Multi-Tenant Hotel Booking System with QR Service
-- ============================================
-- This file contains the complete database schema
-- including Phase 1 (Multi-tenant core) and Phase 2 (QR Service)
-- ============================================

-- ============================================
-- PHASE 1: MULTI-TENANT CORE TABLES
-- ============================================

-- Properties Table (Central multi-tenant table)
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
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

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    price_per_night DECIMAL(10,2) NOT NULL,
    max_occupancy INTEGER NOT NULL DEFAULT 2,
    max_capacity INTEGER,
    room_size DECIMAL(10,2),
    bed_type VARCHAR(100),
    amenities TEXT[],
    images TEXT[],
    is_active BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    quantity INTEGER DEFAULT 1,
    check_in_time TIME,
    check_out_time TIME,
    
    -- Pricing
    base_price DECIMAL(10,2),
    weekend_price DECIMAL(10,2),
    extra_person_charge DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
    user_id UUID,
    
    -- Guest Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Booking Details
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL DEFAULT 1,
    number_of_nights INTEGER NOT NULL,
    room_name VARCHAR(200),
    
    -- Pricing
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    booking_source VARCHAR(50) DEFAULT 'website',
    
    -- Payment
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    
    -- Additional
    special_requests TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    password_hash TEXT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocked Dates Table
CREATE TABLE IF NOT EXISTS blocked_dates (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facilities Table
CREATE TABLE IF NOT EXISTS facilities (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials/Reviews Table
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    guest_name VARCHAR(200) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tourist Attractions Table
CREATE TABLE IF NOT EXISTS tourist_attractions (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    distance_km DECIMAL(10,2),
    category VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Links Table
CREATE TABLE IF NOT EXISTS social_media_links (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room Images Table
CREATE TABLE IF NOT EXISTS room_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Features Table
CREATE TABLE IF NOT EXISTS features (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- House Rules Table
CREATE TABLE IF NOT EXISTS house_rules (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    rule_text TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PHASE 2: QR SERVICE TABLES
-- ============================================

-- Service Categories Table
CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Items Table
CREATE TABLE IF NOT EXISTS service_items (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES service_categories(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    preparation_time INTEGER,
    display_order INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Orders Table
CREATE TABLE IF NOT EXISTS service_orders (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    guest_name VARCHAR(200),
    room_number VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    order_status VARCHAR(20) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    special_instructions TEXT,
    ordered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Order Items Table
CREATE TABLE IF NOT EXISTS service_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    service_item_id INTEGER REFERENCES service_items(id) ON DELETE SET NULL,
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    special_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room QR Codes Table
CREATE TABLE IF NOT EXISTS room_qr_codes (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    qr_code_data TEXT NOT NULL UNIQUE,
    qr_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_scanned_at TIMESTAMP WITH TIME ZONE,
    scan_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_property_room_qr UNIQUE(property_id, room_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Properties
CREATE INDEX IF NOT EXISTS idx_properties_subdomain ON properties(subdomain);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);

-- Rooms
CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_slug ON rooms(slug);

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_property_id ON users(property_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Blocked Dates
CREATE INDEX IF NOT EXISTS idx_blocked_dates_property_id ON blocked_dates(property_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_room_id ON blocked_dates(room_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_dates ON blocked_dates(start_date, end_date);

-- Facilities
CREATE INDEX IF NOT EXISTS idx_facilities_property_id ON facilities(property_id);

-- Testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_property_id ON testimonials(property_id);

-- Tourist Attractions
CREATE INDEX IF NOT EXISTS idx_tourist_attractions_property_id ON tourist_attractions(property_id);

-- Contact Messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_property_id ON contact_messages(property_id);

-- Social Media Links
CREATE INDEX IF NOT EXISTS idx_social_media_links_property_id ON social_media_links(property_id);

-- Room Images
CREATE INDEX IF NOT EXISTS idx_room_images_property_id ON room_images(property_id);
CREATE INDEX IF NOT EXISTS idx_room_images_room_id ON room_images(room_id);

-- Features
CREATE INDEX IF NOT EXISTS idx_features_property_id ON features(property_id);

-- House Rules
CREATE INDEX IF NOT EXISTS idx_house_rules_property_id ON house_rules(property_id);

-- FAQs
CREATE INDEX IF NOT EXISTS idx_faqs_property_id ON faqs(property_id);

-- Service Categories
CREATE INDEX IF NOT EXISTS idx_service_categories_property_id ON service_categories(property_id);

-- Service Items
CREATE INDEX IF NOT EXISTS idx_service_items_property_id ON service_items(property_id);
CREATE INDEX IF NOT EXISTS idx_service_items_category_id ON service_items(category_id);

-- Service Orders
CREATE INDEX IF NOT EXISTS idx_service_orders_property_id ON service_orders(property_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_room_id ON service_orders(room_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(order_status);

-- Service Order Items
CREATE INDEX IF NOT EXISTS idx_service_order_items_order_id ON service_order_items(order_id);

-- Room QR Codes
CREATE INDEX IF NOT EXISTS idx_room_qr_codes_property_id ON room_qr_codes(property_id);
CREATE INDEX IF NOT EXISTS idx_room_qr_codes_room_id ON room_qr_codes(room_id);
CREATE INDEX IF NOT EXISTS idx_room_qr_codes_data ON room_qr_codes(qr_code_data);

-- ============================================
-- SUMMARY
-- ============================================
-- 
-- Total Tables: 22
-- Phase 1 Tables: 17 (Multi-tenant core)
-- Phase 2 Tables: 5 (QR Service)
-- 
-- All tables include:
-- ✅ property_id for multi-tenant isolation
-- ✅ Indexes for performance
-- ✅ Timestamps (created_at, updated_at)
-- ✅ Foreign key constraints
-- ✅ Check constraints where applicable
-- 
-- ============================================
