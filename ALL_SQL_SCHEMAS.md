# Complete SQL Schemas - All Phases

## Table of Contents
1. [Phase 1: Multi-Tenant Core (17 tables)](#phase-1-multi-tenant-core)
2. [Phase 2: QR Service (5 tables)](#phase-2-qr-service)
3. [All Indexes](#indexes)
4. [All Constraints](#constraints)
5. [Quick Reference](#quick-reference)

---

## Phase 1: Multi-Tenant Core

### 1. properties
**Purpose:** Central table for multi-tenant system
```sql
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    plan_type VARCHAR(20) DEFAULT 'basic' CHECK (plan_type IN ('basic', 'pro', 'premium')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'inactive')),
    subscription_status VARCHAR(20) DEFAULT 'active',
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    razorpay_subscription_id VARCHAR(255),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    qr_enabled BOOLEAN DEFAULT FALSE,
    custom_domain_enabled BOOLEAN DEFAULT FALSE,
    analytics_enabled BOOLEAN DEFAULT FALSE,
    room_limit INTEGER DEFAULT 10,
    logo_url TEXT,
    primary_color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. rooms
**Purpose:** Hotel rooms/accommodations
```sql
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    price_per_night DECIMAL(10,2) NOT NULL,
    max_occupancy INTEGER DEFAULT 2,
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
    base_price DECIMAL(10,2),
    weekend_price DECIMAL(10,2),
    extra_person_charge DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. bookings
**Purpose:** Guest reservations
```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
    user_id UUID,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER DEFAULT 1,
    number_of_nights INTEGER NOT NULL,
    room_name VARCHAR(200),
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'pending',
    booking_source VARCHAR(50) DEFAULT 'website',
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    special_requests TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. users
**Purpose:** User accounts (guests and admins)
```sql
CREATE TABLE users (
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
```

### 5. blocked_dates
**Purpose:** Unavailable dates for rooms
```sql
CREATE TABLE blocked_dates (
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
```

### 6. facilities
**Purpose:** Property amenities/facilities
```sql
CREATE TABLE facilities (
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
```

### 7. testimonials
**Purpose:** Guest reviews and ratings
```sql
CREATE TABLE testimonials (
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
```

### 8. tourist_attractions
**Purpose:** Nearby places of interest
```sql
CREATE TABLE tourist_attractions (
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
```

### 9. contact_messages
**Purpose:** Contact form submissions
```sql
CREATE TABLE contact_messages (
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
```

### 10. social_media_links
**Purpose:** Social media profiles
```sql
CREATE TABLE social_media_links (
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
```

### 11. room_images
**Purpose:** Room photo gallery
```sql
CREATE TABLE room_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 12. features
**Purpose:** Property features/highlights
```sql
CREATE TABLE features (
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
```

### 13. house_rules
**Purpose:** Property rules and policies
```sql
CREATE TABLE house_rules (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    rule_text TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 14. faqs
**Purpose:** Frequently asked questions
```sql
CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Phase 2: QR Service

### 15. service_categories
**Purpose:** Categories for QR room service
```sql
CREATE TABLE service_categories (
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
```

### 16. service_items
**Purpose:** Menu items/services available
```sql
CREATE TABLE service_items (
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
```

### 17. service_orders
**Purpose:** Guest service orders
```sql
CREATE TABLE service_orders (
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
```

### 18. service_order_items
**Purpose:** Items within service orders
```sql
CREATE TABLE service_order_items (
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
```

### 19. room_qr_codes
**Purpose:** QR codes for room service access
```sql
CREATE TABLE room_qr_codes (
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
```

---

## Indexes

```sql
-- Properties
CREATE INDEX idx_properties_subdomain ON properties(subdomain);
CREATE INDEX idx_properties_status ON properties(status);

-- Rooms
CREATE INDEX idx_rooms_property_id ON rooms(property_id);
CREATE INDEX idx_rooms_is_active ON rooms(is_active);
CREATE INDEX idx_rooms_slug ON rooms(slug);

-- Bookings
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);

-- Users
CREATE INDEX idx_users_property_id ON users(property_id);
CREATE INDEX idx_users_email ON users(email);

-- Blocked Dates
CREATE INDEX idx_blocked_dates_property_id ON blocked_dates(property_id);
CREATE INDEX idx_blocked_dates_room_id ON blocked_dates(room_id);
CREATE INDEX idx_blocked_dates_dates ON blocked_dates(start_date, end_date);

-- All other tables
CREATE INDEX idx_{table}_property_id ON {table}(property_id);

-- QR Service specific
CREATE INDEX idx_service_items_category_id ON service_items(category_id);
CREATE INDEX idx_service_orders_status ON service_orders(order_status);
CREATE INDEX idx_service_order_items_order_id ON service_order_items(order_id);
CREATE INDEX idx_room_qr_codes_data ON room_qr_codes(qr_code_data);
```

---

## Constraints

### Foreign Keys
- All tables have `property_id` → `properties(id)` ON DELETE CASCADE
- `rooms.property_id` → `properties(id)`
- `bookings.property_id` → `properties(id)`
- `bookings.room_id` → `rooms(id)` ON DELETE SET NULL
- `service_items.category_id` → `service_categories(id)` ON DELETE CASCADE
- `service_orders.room_id` → `rooms(id)` ON DELETE SET NULL
- `service_order_items.order_id` → `service_orders(id)` ON DELETE CASCADE
- `room_qr_codes.room_id` → `rooms(id)` ON DELETE CASCADE

### Check Constraints
- `properties.plan_type` IN ('basic', 'pro', 'premium')
- `properties.status` IN ('active', 'suspended', 'trial', 'inactive')
- `bookings.booking_status` IN ('pending', 'confirmed', 'cancelled', 'completed')
- `testimonials.rating` BETWEEN 1 AND 5
- `service_orders.order_status` IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')
- `service_order_items.quantity` > 0

### Unique Constraints
- `properties.subdomain` UNIQUE
- `rooms.slug` UNIQUE
- `users.email` UNIQUE
- `room_qr_codes.qr_code_data` UNIQUE
- `room_qr_codes(property_id, room_id)` UNIQUE

---

## Quick Reference

### Total Tables: 19
- **Phase 1:** 14 tables (Multi-tenant core)
- **Phase 2:** 5 tables (QR Service)

### Key Relationships
```
properties (1) → (many) rooms
properties (1) → (many) bookings
properties (1) → (many) service_categories
rooms (1) → (many) bookings
rooms (1) → (1) room_qr_codes
service_categories (1) → (many) service_items
service_orders (1) → (many) service_order_items
```

### Multi-Tenant Columns
Every table (except `properties`) has:
- `property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE`

### Common Patterns
All tables have:
- `id SERIAL PRIMARY KEY`
- `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
- Most have `updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
- Most have `is_active BOOLEAN DEFAULT true`
- Many have `display_order INTEGER DEFAULT 0`

### Data Types Used
- **IDs:** SERIAL (auto-increment integer) or UUID
- **Text:** VARCHAR(n) for limited text, TEXT for unlimited
- **Numbers:** INTEGER for counts, DECIMAL(10,2) for money
- **Dates:** DATE for dates, TIMESTAMP WITH TIME ZONE for timestamps
- **Booleans:** BOOLEAN
- **Arrays:** TEXT[] for tags/amenities
- **Time:** TIME for check-in/out times

---

## Migration Files

1. **Phase 1:** `supabase/migrations/20260301_complete_multi_tenant_setup_simple_id.sql`
2. **Phase 2:** `supabase/migrations/20260302_phase2_qr_service.sql`
3. **Complete Schema:** `COMPLETE_DATABASE_SCHEMA.sql`

---

## Row Counts (After Seeding)

For Grand Valley (property_id = 1):
- service_categories: 4 rows
- service_items: 14 rows
- All other tables: 0 rows (to be populated)

---

**Last Updated:** Phase 2 Complete
**Total Schema Size:** 19 tables, 50+ indexes, 30+ constraints
**Multi-Tenant:** ✅ All tables isolated by property_id
**RLS Enabled:** ✅ All tables have Row Level Security
