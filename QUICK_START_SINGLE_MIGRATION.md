# Quick Start - Single Migration File

## 🚀 Run Phase 1 in 3 Steps (20 minutes)

### Step 1: Update Your Info (2 minutes)

Open `supabase/migrations/20260301_complete_multi_tenant_setup.sql`

Find these lines (around line 200):
```sql
email,
phone,
```

Change from:
```sql
'info@grandvalleyresort.com',  -- ⚠️ UPDATE THIS
'+91-XXXXXXXXXX',               -- ⚠️ UPDATE THIS
```

To your actual info:
```sql
'your-real-email@domain.com',
'+91-9876543210',
```

### Step 2: Run the Migration (5 minutes)

1. Go to **Supabase Dashboard**
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the ENTIRE contents of `20260301_complete_multi_tenant_setup.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Wait for "Success" message

**Expected output:**
```
Success. No rows returned
```

### Step 3: Verify It Worked (3 minutes)

Run these verification queries in SQL Editor:

```sql
-- Should show Grand Valley property
SELECT * FROM properties;

-- Should show all rooms linked to Grand Valley
SELECT COUNT(*) as total_rooms, property_id 
FROM rooms 
GROUP BY property_id;

-- Should show all bookings linked to Grand Valley
SELECT COUNT(*) as total_bookings, property_id 
FROM bookings 
GROUP BY property_id;
```

**Expected results:**
- 1 property named "Grand Valley Resort"
- All rooms have the same property_id
- All bookings have the same property_id

---

## ✅ That's It for Database!

Your database is now multi-tenant ready.

**Next:** Update your code (see PHASE_1_IMPLEMENTATION_GUIDE.md)

---

## 🆘 Troubleshooting

### Error: "relation already exists"
**Cause:** You already ran part of the migration before
**Solution:** This is OK! The migration uses `IF NOT EXISTS` so it's safe to run multiple times

### Error: "column already exists"
**Cause:** property_id column was already added
**Solution:** This is OK! The migration uses `IF NOT EXISTS` so it's safe

### Error: "duplicate key value violates unique constraint"
**Cause:** Grand Valley property already exists
**Solution:** This is OK! The migration uses `ON CONFLICT DO NOTHING`

### No errors but no data in properties table
**Cause:** The INSERT might have been skipped
**Solution:** Run this manually:
```sql
INSERT INTO properties (
    id, name, subdomain, plan_type, status, subscription_status,
    email, phone, qr_enabled, custom_domain_enabled, analytics_enabled, room_limit
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Grand Valley Resort', 'grandvalley', 'premium', 'active', 'active',
    'your-email@domain.com', '+91-9876543210', true, true, true, 50
);
```

---

## 📊 What This Migration Does

1. ✅ Creates `properties` table
2. ✅ Adds `property_id` to 13+ tables
3. ✅ Creates Grand Valley as first property
4. ✅ Links all existing data to Grand Valley
5. ✅ Enables Row Level Security
6. ✅ Creates database indexes
7. ✅ Sets up RLS policies

---

## 🎯 Next Steps

After running this migration:

1. **Update main.tsx** (5 minutes)
   - Add PropertyProvider wrapper
   - See PHASE_1_IMPLEMENTATION_GUIDE.md

2. **Update queries** (1-2 weeks)
   - Run: `node scripts/find-queries-to-update.js`
   - Update files one by one
   - See MULTI_TENANT_QUERY_PATTERNS.md

3. **Test** (2-3 days)
   - Create test property
   - Verify data isolation
   - Test all features

---

## 💡 Pro Tips

- **Safe to re-run:** This migration is idempotent (safe to run multiple times)
- **No data loss:** All existing data is preserved and linked to Grand Valley
- **Backward compatible:** Grand Valley will work exactly as before
- **Rollback:** If needed, you can remove property_id columns (but backup first!)

---

## 🔄 Alternative: Use Separate Files

If you prefer separate migration files (for better version control):
- Use the 5 files in `supabase/migrations/` folder
- Run them in order (see PHASE_1_IMPLEMENTATION_GUIDE.md)

Both approaches achieve the same result!

---

## ✨ You're Done with Database Setup!

Database is now multi-tenant. Time to update the code! 🚀
