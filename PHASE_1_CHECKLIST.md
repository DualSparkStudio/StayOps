# Phase 1: Multi-Tenant Core - Implementation Checklist

Use this checklist to track your Phase 1 implementation progress.

---

## 🗄️ Database Setup

### Migrations
- [ ] Run `20260301_create_properties_table.sql`
- [ ] Run `20260301_add_property_id_to_tables.sql`
- [ ] Run `20260301_add_features_and_faqs_property_id.sql`
- [ ] Update email/phone in `20260301_seed_initial_property.sql`
- [ ] Run `20260301_seed_initial_property.sql`
- [ ] Run `20260301_enable_rls_for_multi_tenant.sql`

### Verification
- [ ] Verify `properties` table exists
- [ ] Verify Grand Valley property created (subdomain: 'grandvalley')
- [ ] Verify all tables have `property_id` column
- [ ] Verify all existing data linked to Grand Valley
- [ ] Verify RLS enabled on all tables
- [ ] Check for migration errors in Supabase logs

---

## 🔧 Code Integration

### App Setup
- [ ] Add PropertyProvider to `src/main.tsx`
- [ ] Wrap app with PropertyProvider (before AuthProvider)
- [ ] Test app loads without errors
- [ ] Check browser console for property detection

### Development Testing
- [ ] Set `localStorage.setItem('dev_subdomain', 'grandvalley')`
- [ ] Verify property loads in console
- [ ] Check sessionStorage has `current_property_id`
- [ ] Test property context in React DevTools

---

## 📄 Update Pages - High Priority

### Public Pages
- [ ] `src/pages/Rooms.tsx` - Room listing
- [ ] `src/pages/RoomDetail.tsx` - Individual room
- [ ] `src/pages/BookingForm.tsx` - Booking creation
- [ ] `src/pages/TouristAttractions.tsx` - Attractions listing
- [ ] `src/pages/Features.tsx` - Features page
- [ ] `src/pages/Contact.tsx` - Contact form

### Admin Pages - Core
- [ ] `src/pages/AdminDashboard.tsx` - Dashboard stats
- [ ] `src/pages/AdminRooms.tsx` - Room management
- [ ] `src/pages/AdminBookings.tsx` - Booking management
- [ ] `src/pages/AdminCalendar.tsx` - Calendar & blocked dates

### Admin Pages - Content
- [ ] `src/pages/AdminAttractions.tsx` - Attractions management
- [ ] `src/pages/AdminFacilities.tsx` - Facilities management
- [ ] `src/pages/AdminReviews.tsx` - Reviews management
- [ ] `src/pages/AdminSocialMedia.tsx` - Social media links
- [ ] `src/pages/AdminFAQ.tsx` - FAQ management
- [ ] `src/pages/AdminHouseRules.tsx` - House rules management
- [ ] `src/pages/AdminFeatures.tsx` - Features management

---

## 🔌 Update Netlify Functions

### Email Functions
- [ ] `netlify/functions/send-booking-email.js`
- [ ] `netlify/functions/send-booking-confirmation.js`
- [ ] `netlify/functions/send-booking-notifications.js`
- [ ] `netlify/functions/send-contact-email.js`

### Payment Functions
- [ ] `netlify/functions/create-razorpay-order.js`

### Other Functions
- [ ] `netlify/functions/calendar-feed.js`
- [ ] `netlify/functions/get-google-reviews.js`
- [ ] `netlify/functions/auth.js` (if needed)
- [ ] `netlify/functions/simple-auth.js` (if needed)
- [ ] `netlify/functions/hybrid-auth.js` (if needed)

---

## 🧪 Testing

### Create Test Property
- [ ] Create second property in database
  ```sql
  INSERT INTO properties (name, subdomain, plan_type, status, subscription_status)
  VALUES ('Test Hotel', 'testhotel', 'basic', 'active', 'active');
  ```
- [ ] Note the property ID
- [ ] Create test room for test property
- [ ] Create test booking for test property

### Test Data Isolation
- [ ] Set subdomain to 'grandvalley'
- [ ] Verify Grand Valley rooms appear
- [ ] Verify Grand Valley bookings appear
- [ ] Set subdomain to 'testhotel'
- [ ] Verify ONLY test hotel data appears
- [ ] Verify Grand Valley data does NOT appear
- [ ] Switch back to 'grandvalley'
- [ ] Verify Grand Valley data still intact

### Test CRUD Operations
- [ ] Create new room (verify property_id added)
- [ ] Update room (verify only affects current property)
- [ ] Delete room (verify only affects current property)
- [ ] Create booking (verify property_id added)
- [ ] Update booking (verify only affects current property)

### Test Admin Functions
- [ ] Admin dashboard loads correctly
- [ ] Room management works
- [ ] Booking management works
- [ ] Calendar shows correct data
- [ ] Statistics are property-specific

### Test Public Functions
- [ ] Room listing shows correct rooms
- [ ] Room detail page works
- [ ] Booking form works
- [ ] Contact form works
- [ ] Attractions page works

---

## 🔍 Code Quality

### Run Scanner
- [ ] Run `node scripts/find-queries-to-update.js`
- [ ] Review output for missed queries
- [ ] Update any remaining queries
- [ ] Run scanner again to verify

### Code Review
- [ ] All `supabase.from()` calls have property_id filter
- [ ] All INSERT operations include property_id
- [ ] All UPDATE operations filter by property_id
- [ ] All DELETE operations filter by property_id
- [ ] No hardcoded property IDs (except in migrations)

### Error Handling
- [ ] Handle missing property gracefully
- [ ] Show error if property not found
- [ ] Show loading state while property loads
- [ ] Handle property_id null cases

---

## 📊 Performance

### Database
- [ ] Verify indexes created on property_id columns
- [ ] Check query performance in Supabase dashboard
- [ ] Ensure no slow queries (> 500ms)

### Frontend
- [ ] Property cached in sessionStorage
- [ ] No unnecessary property lookups
- [ ] Page load time acceptable (< 3s)

---

## 🚀 Deployment

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds locally
- [ ] Environment variables set

### Staging Deployment
- [ ] Deploy to staging environment
- [ ] Test with real subdomain
- [ ] Verify DNS/subdomain routing
- [ ] Test all major features
- [ ] Check error logs

### Production Deployment
- [ ] Backup database
- [ ] Run migrations on production
- [ ] Deploy code to production
- [ ] Verify Grand Valley still works
- [ ] Monitor error logs
- [ ] Test booking flow end-to-end

---

## 📚 Documentation

### Code Documentation
- [ ] Add comments to complex logic
- [ ] Document property context usage
- [ ] Update README if needed

### Team Documentation
- [ ] Share implementation guide with team
- [ ] Document query patterns
- [ ] Create troubleshooting guide

---

## ✅ Final Verification

### Functionality
- [ ] All pages load without errors
- [ ] All admin functions work
- [ ] All public functions work
- [ ] Bookings can be created
- [ ] Emails are sent correctly
- [ ] Payments work (if applicable)

### Data Integrity
- [ ] No data loss from Grand Valley
- [ ] All existing bookings intact
- [ ] All existing rooms intact
- [ ] All existing users intact

### Multi-Tenancy
- [ ] Can create new properties
- [ ] Data completely isolated
- [ ] Subdomain routing works
- [ ] No cross-property data leakage

### Performance
- [ ] Page load times acceptable
- [ ] Query performance good
- [ ] No memory leaks
- [ ] No excessive API calls

---

## 🎯 Success Criteria

Phase 1 is complete when ALL of these are true:

- ✅ All migrations run successfully
- ✅ PropertyProvider integrated in app
- ✅ All database queries filter by property_id
- ✅ 2+ test properties created and tested
- ✅ Complete data isolation verified
- ✅ Grand Valley works exactly as before
- ✅ No errors in console or logs
- ✅ All major features tested and working
- ✅ Code deployed to staging/production
- ✅ Team trained on new patterns

---

## 📝 Notes & Issues

Use this section to track any issues or notes during implementation:

### Issues Found
```
Date: ___________
Issue: ___________
Solution: ___________
Status: ___________
```

### Questions
```
Q: ___________
A: ___________
```

### Improvements
```
Idea: ___________
Priority: ___________
Status: ___________
```

---

## 🚀 Ready for Phase 2?

Before moving to Phase 2, ensure:
- [ ] All items in this checklist completed
- [ ] Phase 1 tested thoroughly
- [ ] No critical bugs
- [ ] Team comfortable with multi-tenant patterns
- [ ] Documentation up to date

**Phase 2 Focus:** Merge QR Room Service under property context

---

## 📞 Need Help?

If stuck on any item:
1. Check `PHASE_1_IMPLEMENTATION_GUIDE.md`
2. Review `MULTI_TENANT_QUERY_PATTERNS.md`
3. Check `ARCHITECTURE_DIAGRAM.md`
4. Run `node scripts/find-queries-to-update.js`
5. Review Supabase logs for errors

---

**Started:** ___________
**Completed:** ___________
**Time Taken:** ___________
