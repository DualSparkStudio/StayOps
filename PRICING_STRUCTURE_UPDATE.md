# Pricing Structure Update Summary

## Changes Made

### 1. Database Migration
**File:** `supabase/migrations/add_pricing_fields.sql`

Added new columns to `rooms` table:
- `child_above_5_price` (DECIMAL, default: 0) - Price per child above 5 years per night
- `gst_percentage` (DECIMAL, default: 12) - GST percentage to apply
- `check_in_time` (TEXT, default: '12:00 PM') - Hardcoded check-in time
- `check_out_time` (TEXT, default: '10:00 AM') - Hardcoded check-out time
- Made `max_occupancy` nullable (optional field)

### 2. Room Interface Update
**File:** `src/lib/supabase.ts`

Updated Room interface:
- Removed: `price_double_occupancy`, `price_triple_occupancy`, `price_four_occupancy`
- Added: `child_above_5_price`, `gst_percentage`
- Updated: `price_per_night` now represents couple (2 adults) pricing
- Made `max_occupancy` optional
- Hardcoded check-in/check-out times

### 3. Admin Panel Updates
**File:** `src/pages/AdminRooms.tsx`

Form changes:
- Removed "Max Occupancy" field
- Removed "Double Occupancy", "Triple Occupancy" pricing fields
- Added "Child Above 5 Years" price field
- Added "GST %" field
- Updated "Price per Night" label to "Price per Night (Couple)"
- Removed check-in/check-out time configuration section
- Updated validation to remove max_occupancy checks
- Updated table to show "Price/Night (Couple)" instead of "Price/Night"
- Removed "Max Occupancy" column from table

### 4. Display Pages Updates

**File:** `src/pages/Rooms.tsx`
- Removed "Max Guests" display from room cards
- Changed grid from 3 columns to 2 columns (removed max guests stat)

**File:** `src/pages/RoomDetail.tsx`
- Removed "Max Guests" stat display
- Changed grid from 4 columns to 3 columns
- Updated guest dropdown to show 1-10 guests (fixed range)
- Removed check-in/check-out times display section

**File:** `src/pages/BookingForm.tsx`
- Removed "Max occupancy" display
- Updated price label to "Price per night (Couple)"
- Updated guest dropdown to show 1-10 guests (fixed range)
- Removed check-in/check-out times display section

**File:** `src/pages/Home.tsx`
- Removed "Up to X guests" display from room cards
- Set default bedroom count to "2 Bedroom"

### 5. Admin Bookings Page
**File:** `src/pages/AdminBookings.tsx`
- Removed "All Sources" filter dropdown
- Removed "All Statuses" filter dropdown
- Added "All Room Types" filter dropdown
- Added "Check-in" date filter
- Added "Check-out" date filter
- Updated filter logic to work with new filters

## New Pricing Structure

### Base Pricing
- **Price per Night**: Base price for couple (2 adults)
- **Extra Guest Price**: Additional charge per extra adult per night
- **Child Above 5 Years**: Charge per child above 5 years per night
- **Extra Mattress Price**: Charge per extra mattress per night (default: ₹200)
- **GST**: Percentage to apply on total (default: 12%)

### Hardcoded Times
- **Check-in Time**: 12:00 PM (noon)
- **Check-out Time**: 10:00 AM

### Guest Selection
- Users can select 1-10 guests from dropdown
- No max occupancy restriction in UI
- Pricing calculated based on:
  - Base couple price
  - Extra adults
  - Children above 5 years
  - Extra mattresses
  - GST percentage

## Migration Steps Completed

1. ✅ Created SQL migration file
2. ✅ Updated Room interface in TypeScript
3. ✅ Updated AdminRooms form and validation
4. ✅ Removed max_occupancy displays from all pages
5. ✅ Updated guest dropdowns to fixed range (1-10)
6. ✅ Removed check-in/check-out time sections
7. ✅ Updated admin bookings filters

## Next Steps for User

The migration SQL has been run in Supabase. The system is now ready to use with the new pricing structure.

## Testing Checklist

- [ ] Create a new room type with new pricing fields
- [ ] Edit an existing room type
- [ ] View room details on frontend
- [ ] Make a test booking
- [ ] Check admin bookings page filters
- [ ] Verify GST calculation in booking
- [ ] Verify child pricing in booking
