# 🚀 START HERE - Phase 1 Setup

## Your 3-Step Quick Start

### ⚡ Step 1: Run Database Migration (10 minutes)

1. Open file: `supabase/migrations/20260301_complete_multi_tenant_setup.sql`
2. Find line ~200, update your email and phone:
   ```sql
   'your-email@domain.com',  -- Change this
   '+91-9876543210',          -- Change this
   ```
3. Copy the entire file
4. Go to Supabase Dashboard → SQL Editor
5. Paste and click **Run**
6. Wait for "Success" ✅

**Verify it worked:**
```sql
SELECT * FROM properties;
-- Should show "Grand Valley Resort"
```

---

### 🔧 Step 2: Update App Code (5 minutes)

Open `src/main.tsx` and add PropertyProvider:

```typescript
// Add this import at top
import { PropertyProvider } from './contexts/PropertyContext'

// Wrap your App like this:
<StrictMode>
  {isLoading ? (
    <Preloader onComplete={() => setIsLoading(false)} />
  ) : (
    <PropertyProvider>  {/* ADD THIS LINE */}
      <App />
    </PropertyProvider>  {/* ADD THIS LINE */}
  )}
</StrictMode>
```

Save and test that app still loads.

---

### 📝 Step 3: Update Queries (1-2 weeks)

Run the scanner to find what needs updating:
```bash
node scripts/find-queries-to-update.js
```

Then update queries using patterns from `MULTI_TENANT_QUERY_PATTERNS.md`

**Example:**
```typescript
// OLD
const { data } = await supabase.from('rooms').select('*');

// NEW (Option 1 - Easiest)
import { roomsQuery } from '../lib/supabase-multi-tenant';
const { data } = await roomsQuery.getAll();

// NEW (Option 2 - Manual)
import { usePropertyId } from '../contexts/PropertyContext';
const propertyId = usePropertyId();
const { data } = await supabase
  .from('rooms')
  .select('*')
  .eq('property_id', propertyId);
```

---

## 📚 Detailed Guides

- **Quick database setup:** `QUICK_START_SINGLE_MIGRATION.md`
- **Complete guide:** `PHASE_1_IMPLEMENTATION_GUIDE.md`
- **Query patterns:** `MULTI_TENANT_QUERY_PATTERNS.md`
- **Architecture:** `ARCHITECTURE_DIAGRAM.md`
- **Track progress:** `PHASE_1_CHECKLIST.md`

---

## 🎯 Priority Files to Update

Update these files first (in order):

1. `src/pages/Rooms.tsx`
2. `src/pages/RoomDetail.tsx`
3. `src/pages/BookingForm.tsx`
4. `src/pages/AdminRooms.tsx`
5. `src/pages/AdminBookings.tsx`
6. `src/pages/AdminCalendar.tsx`

Then update remaining pages and Netlify functions.

---

## ✅ Success Checklist

You're done when:
- [ ] Migration ran successfully
- [ ] PropertyProvider added to main.tsx
- [ ] App loads without errors
- [ ] Created 2nd test property
- [ ] Both properties show different data
- [ ] No data leakage between properties

---

## 🆘 Need Help?

**Common issues:**
- Migration errors → See `QUICK_START_SINGLE_MIGRATION.md` troubleshooting
- Query errors → See `MULTI_TENANT_QUERY_PATTERNS.md` examples
- Empty results → Check property_id is being passed

**Ask me if you see:**
- ❌ Migration errors
- ❌ TypeScript errors
- ❌ Data appearing across properties
- ❌ Queries returning empty

---

## ⏱️ Time Estimate

- Database setup: **10 minutes**
- Code setup: **5 minutes**
- Update queries: **1-2 weeks** (systematic work)
- Testing: **2-3 days**
- **Total: 1-2 weeks to complete Phase 1**

---

## 🎉 What You're Building

```
Before (Single Tenant):
One website → One hotel → One database

After (Multi-Tenant):
grandvalley.stayops.net → Grand Valley data
hotel2.stayops.net      → Hotel 2 data
hotel3.stayops.net      → Hotel 3 data
                ↓
        Same codebase
        Same database
        Complete isolation
```

---

## 🚀 Let's Go!

Start with Step 1 (database migration) right now. It takes 10 minutes and you'll see immediate results!

Then tackle Step 2 (5 minutes), and you're ready to start updating queries.

You got this! 💪
