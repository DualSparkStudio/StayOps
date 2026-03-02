# Phase 1: Multi-Tenant Core - Implementation Guide

## ✅ What's Been Created

### 1. Database Migrations (5 files)
Located in `supabase/migrations/`:

- **20260301_create_properties_table.sql** - Creates the central `properties` table
- **20260301_add_property_id_to_tables.sql** - Adds `property_id` to all core tables
- **20260301_add_features_and_faqs_property_id.sql** - Adds `property_id` to features/FAQs
- **20260301_seed_initial_property.sql** - Creates Grand Valley as first property
- **20260301_enable_rls_for_multi_tenant.sql** - Enables Row Level Security

### 2. TypeScript Utilities (3 files)
- **src/lib/property-context.ts** - Property detection and management utilities
- **src/contexts/PropertyContext.tsx** - React Context Provider for property
- **src/lib/supabase-multi-tenant.ts** - Query helpers with automatic property_id filtering

---

## 🚀 Next Steps to Complete Phase 1

### Step 1: Run Database Migrations

**OPTION A: Single File (Recommended - Easiest)**

1. Open `supabase/migrations/20260301_complete_multi_tenant_setup.sql`
2. Update email and phone (search for "UPDATE WITH YOUR INFO")
3. Copy entire file contents
4. Paste into Supabase SQL Editor
5. Click Run

See `QUICK_START_SINGLE_MIGRATION.md` for detailed instructions.

**OPTION B: Separate Files (Better for version control)**

Run these migrations in your Supabase SQL Editor in order:

```bash
# In Supabase Dashboard > SQL Editor, run each file in order:
1. 20260301_create_properties_table.sql
2. 20260301_add_property_id_to_tables.sql
3. 20260301_add_features_and_faqs_property_id.sql
4. 20260301_seed_initial_property.sql (update email/phone first)
5. 20260301_enable_rls_for_multi_tenant.sql
```

Both options achieve the same result!

### Step 2: Wrap Your App with PropertyProvider

Update `src/main.tsx`:

```tsx
import { PropertyProvider } from './contexts/PropertyContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PropertyProvider>
      <AuthProvider>
        <MaintenanceProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MaintenanceProvider>
      </AuthProvider>
    </PropertyProvider>
  </React.StrictMode>
);
```

### Step 3: Update All Database Queries

You need to update every Supabase query in your codebase. Here's the pattern:

#### ❌ OLD WAY (Single Tenant)
```typescript
const { data: rooms } = await supabase
  .from('rooms')
  .select('*')
  .eq('is_active', true);
```

#### ✅ NEW WAY (Multi-Tenant) - Option 1: Use Helper Functions
```typescript
import { roomsQuery } from '../lib/supabase-multi-tenant';

const { data: rooms } = await roomsQuery.getAll();
```

#### ✅ NEW WAY (Multi-Tenant) - Option 2: Manual Filtering
```typescript
import { usePropertyId } from '../contexts/PropertyContext';

function MyComponent() {
  const propertyId = usePropertyId();
  
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true);
}
```

### Step 4: Update These Files (Priority Order)

#### High Priority - Core Functionality
1. **src/pages/Rooms.tsx** - Room listing
2. **src/pages/RoomDetail.tsx** - Individual room view
3. **src/pages/BookingForm.tsx** - Booking creation
4. **src/pages/AdminRooms.tsx** - Admin room management
5. **src/pages/AdminBookings.tsx** - Admin booking management
6. **src/pages/AdminCalendar.tsx** - Calendar with blocked dates

#### Medium Priority - Admin Features
7. **src/pages/AdminAttractions.tsx** - Tourist attractions
8. **src/pages/AdminFacilities.tsx** - Facilities management
9. **src/pages/AdminReviews.tsx** - Reviews/testimonials
10. **src/pages/AdminSocialMedia.tsx** - Social media links
11. **src/pages/AdminFAQ.tsx** - FAQs
12. **src/pages/AdminHouseRules.tsx** - House rules

#### Lower Priority - Public Pages
13. **src/pages/TouristAttractions.tsx** - Public attractions view
14. **src/pages/Features.tsx** - Public features view
15. **src/pages/Contact.tsx** - Contact form

### Step 5: Update Netlify Functions

All Netlify functions need to accept and use `property_id`:

**Example: netlify/functions/send-booking-email.js**

```javascript
// OLD
const { data: booking } = await supabase
  .from('bookings')
  .select('*, rooms(*)')
  .eq('id', bookingId)
  .single();

// NEW
const { data: booking } = await supabase
  .from('bookings')
  .select('*, rooms(*)')
  .eq('property_id', propertyId)  // Add this
  .eq('id', bookingId)
  .single();
```

Functions to update:
- `send-booking-email.js`
- `send-booking-confirmation.js`
- `send-booking-notifications.js`
- `create-razorpay-order.js`
- `calendar-feed.js`
- `get-google-reviews.js`

---

## 🧪 Testing Phase 1

### Test 1: Create a Second Test Property

Run in Supabase SQL Editor:

```sql
INSERT INTO properties (
    name,
    subdomain,
    plan_type,
    status,
    subscription_status
) VALUES (
    'Test Hotel',
    'testhotel',
    'basic',
    'active',
    'active'
);
```

### Test 2: Verify Data Isolation

1. Visit `grandvalley.stayops.net` (or localhost with dev_subdomain='grandvalley')
2. Check that you see Grand Valley's rooms
3. Change localStorage: `localStorage.setItem('dev_subdomain', 'testhotel')`
4. Refresh page
5. Verify you see NO rooms (testhotel has no data yet)

### Test 3: Create Test Data for Second Property

```sql
-- Get the testhotel property_id
SELECT id FROM properties WHERE subdomain = 'testhotel';

-- Insert a test room (replace <property_id> with actual UUID)
INSERT INTO rooms (
    property_id,
    room_number,
    name,
    slug,
    description,
    price_per_night,
    max_occupancy,
    is_active
) VALUES (
    '<property_id>',
    '101',
    'Test Room',
    'test-room',
    'A test room for the test hotel',
    1000,
    2,
    true
);
```

### Test 4: Verify Queries Work

In your browser console:

```javascript
// Should return Grand Valley rooms
localStorage.setItem('dev_subdomain', 'grandvalley');
location.reload();

// Should return Test Hotel rooms
localStorage.setItem('dev_subdomain', 'testhotel');
location.reload();
```

---

## 📋 Checklist

- [ ] All 5 migrations run successfully in Supabase
- [ ] PropertyProvider added to main.tsx
- [ ] All room queries updated with property_id
- [ ] All booking queries updated with property_id
- [ ] All admin panel queries updated with property_id
- [ ] All Netlify functions updated with property_id
- [ ] Tested with 2 different properties
- [ ] Verified data isolation between properties
- [ ] No errors in browser console
- [ ] No errors in Supabase logs

---

## 🔍 Common Issues & Solutions

### Issue: "Property context is required but not available"
**Solution:** Make sure PropertyProvider wraps your entire app in main.tsx

### Issue: Queries return empty results
**Solution:** Check that property_id is being passed correctly. Use browser DevTools Network tab to inspect Supabase requests.

### Issue: RLS policy errors
**Solution:** Ensure you're using the service role key for admin operations, or update RLS policies.

### Issue: Subdomain not detected in development
**Solution:** Use `localStorage.setItem('dev_subdomain', 'grandvalley')` to simulate subdomain.

---

## 📊 Expected Outcome

After completing Phase 1:

✅ Database supports multiple properties
✅ All data is isolated by property_id
✅ Subdomain routing works (grandvalley.stayops.net)
✅ Can create test properties and verify isolation
✅ Grand Valley continues to work as before
✅ Foundation ready for Phase 2 (QR service) and Phase 3 (Super Admin)

---

## 🎯 Performance Notes

- All queries now have an additional `property_id` filter
- Indexes created on `property_id` columns for fast lookups
- RLS policies are permissive (filtering happens at app level)
- Session storage used to cache property lookup

---

## 🚨 Important Reminders

1. **NEVER** query without property_id filter (except for super admin)
2. **ALWAYS** use `requirePropertyId()` or `usePropertyId()` hook
3. **TEST** with multiple properties before going to production
4. **BACKUP** your database before running migrations
5. **UPDATE** the Grand Valley email/phone in seed migration

---

## Next: Phase 2

Once Phase 1 is complete and tested, you'll be ready for:
- Phase 2: Merge QR service under property
- Phase 3: Super Admin panel
- Phase 4: Plan & feature gating
