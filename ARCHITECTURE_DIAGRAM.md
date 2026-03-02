# StayOps Multi-Tenant Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ACCESS LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  🌐 grandvalley.stayops.net  →  Grand Valley Resort                 │
│  🌐 hotel2.stayops.net       →  Hotel 2                             │
│  🌐 hotel3.stayops.net       →  Hotel 3                             │
│  🌐 stayops.net              →  Marketing Site / Super Admin        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  📱 React Frontend (Single Deployment)                              │
│     ├── PropertyContext (detects subdomain)                         │
│     ├── Loads property from database                                │
│     └── Filters all queries by property_id                          │
│                                                                       │
│  ⚡ Netlify Functions                                               │
│     ├── Booking emails                                              │
│     ├── Payment processing                                          │
│     └── Calendar feeds                                              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  🗄️  Supabase PostgreSQL (Single Database)                         │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  properties (Central Table)                                  │   │
│  │  ├── id (UUID)                                              │   │
│  │  ├── name                                                   │   │
│  │  ├── subdomain (unique)                                     │   │
│  │  ├── plan_type (basic/pro/premium)                         │   │
│  │  ├── status (active/suspended/trial)                       │   │
│  │  └── feature flags                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  rooms                                                       │   │
│  │  ├── id                                                     │   │
│  │  ├── property_id → properties(id)                          │   │
│  │  ├── room_number                                           │   │
│  │  └── ... other fields                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  bookings                                                    │   │
│  │  ├── id                                                     │   │
│  │  ├── property_id → properties(id)                          │   │
│  │  ├── room_id                                               │   │
│  │  └── ... other fields                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ... all other tables with property_id ...                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### 1. User Visits Subdomain
```
User → grandvalley.stayops.net
         ↓
React App Loads
         ↓
PropertyContext extracts "grandvalley"
         ↓
Query: SELECT * FROM properties WHERE subdomain = 'grandvalley'
         ↓
Property loaded (id: 0000...0001)
         ↓
Stored in sessionStorage
```

### 2. User Views Rooms
```
User clicks "Rooms"
         ↓
Component: const propertyId = usePropertyId()
         ↓
Query: SELECT * FROM rooms WHERE property_id = '0000...0001'
         ↓
Only Grand Valley's rooms returned
         ↓
Rendered to user
```

### 3. User Makes Booking
```
User submits booking form
         ↓
Frontend: bookingsQuery.create({ ...data })
         ↓
Query: INSERT INTO bookings (property_id, room_id, ...)
       VALUES ('0000...0001', 5, ...)
         ↓
Booking created for Grand Valley
         ↓
Email sent via Netlify Function
```

---

## 🔐 Data Isolation Model

```
┌──────────────────────────────────────────────────────────────┐
│                    Property: Grand Valley                     │
│                    ID: 0000...0001                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Rooms:                                                       │
│  ├── Room 101 (property_id: 0000...0001)                    │
│  ├── Room 102 (property_id: 0000...0001)                    │
│  └── Room 103 (property_id: 0000...0001)                    │
│                                                               │
│  Bookings:                                                    │
│  ├── Booking #1 (property_id: 0000...0001)                  │
│  ├── Booking #2 (property_id: 0000...0001)                  │
│  └── Booking #3 (property_id: 0000...0001)                  │
│                                                               │
│  Users:                                                       │
│  ├── Admin User (property_id: 0000...0001)                  │
│  └── Guest User (property_id: 0000...0001)                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    Property: Hotel 2                          │
│                    ID: <uuid-2>                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Rooms:                                                       │
│  ├── Room 201 (property_id: <uuid-2>)                       │
│  └── Room 202 (property_id: <uuid-2>)                       │
│                                                               │
│  Bookings:                                                    │
│  └── Booking #1 (property_id: <uuid-2>)                     │
│                                                               │
│  Users:                                                       │
│  └── Admin User (property_id: <uuid-2>)                     │
│                                                               │
└──────────────────────────────────────────────────────────────┘

❌ Hotel 2 CANNOT see Grand Valley's data
❌ Grand Valley CANNOT see Hotel 2's data
✅ Complete isolation via property_id filtering
```

---

## 🎯 Query Filtering Pattern

### Before (Single Tenant)
```typescript
// ❌ Returns ALL rooms from ALL properties
const { data } = await supabase
  .from('rooms')
  .select('*');
```

### After (Multi-Tenant)
```typescript
// ✅ Returns ONLY rooms for current property
const propertyId = usePropertyId();
const { data } = await supabase
  .from('rooms')
  .select('*')
  .eq('property_id', propertyId);
```

### Using Helper (Recommended)
```typescript
// ✅ property_id added automatically
const { data } = await roomsQuery.getAll();
```

---

## 📊 Plan-Based Features (Phase 4)

```
┌─────────────────────────────────────────────────────────────┐
│                      BASIC PLAN                              │
│                      ₹999/month                              │
├─────────────────────────────────────────────────────────────┤
│  ✅ Booking System                                          │
│  ✅ Up to 10 rooms                                          │
│  ✅ Subdomain (hotel.stayops.net)                           │
│  ✅ Email notifications                                      │
│  ❌ QR Room Service                                         │
│  ❌ Custom Domain                                           │
│  ❌ Analytics                                               │
│  ⚠️  StayOps Branding                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       PRO PLAN                               │
│                      ₹2,999/month                            │
├─────────────────────────────────────────────────────────────┤
│  ✅ Everything in Basic                                     │
│  ✅ Up to 50 rooms                                          │
│  ✅ QR Room Service                                         │
│  ✅ Order tracking                                          │
│  ✅ Custom Domain                                           │
│  ✅ Priority Support                                        │
│  ❌ Analytics                                               │
│  ⚠️  StayOps Branding                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    PREMIUM PLAN                              │
│                      ₹4,999/month                            │
├─────────────────────────────────────────────────────────────┤
│  ✅ Everything in Pro                                       │
│  ✅ Up to 200 rooms                                         │
│  ✅ Advanced Analytics                                      │
│  ✅ Multi-user roles                                        │
│  ✅ White-label (no branding)                               │
│  ✅ API Access                                              │
│  ✅ Dedicated Support                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Subscription Flow (Phase 5)

```
┌─────────────────────────────────────────────────────────────┐
│                  SUBSCRIPTION LIFECYCLE                      │
└─────────────────────────────────────────────────────────────┘

1. Property Created
   ↓
   status: 'trial'
   subscription_status: 'trialing'
   trial_ends_at: +7 days

2. Trial Period (7 days)
   ↓
   Full access to selected plan
   Reminder emails at day 5, 6, 7

3. Trial Ends
   ↓
   Razorpay subscription created
   First payment attempted

4a. Payment Success              4b. Payment Failed
    ↓                                ↓
    status: 'active'                 status: 'active'
    subscription_status: 'active'    subscription_status: 'past_due'
                                     Grace period: 5 days

5a. Ongoing                      5b. Grace Period Ends
    ↓                                ↓
    Monthly billing                  status: 'suspended'
    Auto-renewal                     Access blocked
                                     Data retained

6a. Cancellation                 6b. Reactivation
    ↓                                ↓
    subscription_status: 'cancelled' Payment processed
    Access until period end          status: 'active'
    Then suspended                   Full access restored
```

---

## 🏢 Super Admin Architecture (Phase 3)

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPER ADMIN PANEL                         │
│                    admin.stayops.net                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Dashboard                                                    │
│  ├── Total Properties: 25                                   │
│  ├── Active: 20                                             │
│  ├── Trial: 3                                               │
│  ├── Suspended: 2                                           │
│  └── MRR: ₹45,000                                           │
│                                                               │
│  Properties List                                              │
│  ├── Grand Valley (Premium, Active)                         │
│  ├── Hotel 2 (Pro, Active)                                  │
│  ├── Hotel 3 (Basic, Trial)                                 │
│  └── [+ Create New Property]                                │
│                                                               │
│  Actions                                                      │
│  ├── Create Property                                         │
│  ├── Suspend Property                                        │
│  ├── Change Plan                                             │
│  ├── View Analytics                                          │
│  └── Send Notifications                                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Netlify                                                      │
│  ├── Single React App Deployment                            │
│  ├── Serverless Functions                                   │
│  └── CDN Distribution                                        │
│                                                               │
│  Supabase                                                     │
│  ├── PostgreSQL Database                                    │
│  ├── Authentication                                          │
│  ├── Storage (images)                                       │
│  └── Edge Functions                                         │
│                                                               │
│  Cloudinary                                                   │
│  └── Image Hosting & Optimization                           │
│                                                               │
│  Razorpay                                                     │
│  ├── Payment Gateway                                        │
│  └── Subscription Management                                │
│                                                               │
│  DNS (Cloudflare/Namecheap)                                  │
│  ├── stayops.net → Netlify                                  │
│  ├── *.stayops.net → Netlify (wildcard)                    │
│  └── Custom domains → CNAME to Netlify                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Scaling Strategy

### Current (Phase 1)
- 1 property (Grand Valley)
- Single deployment
- Manual management

### Near Term (Months 1-3)
- 5-10 properties
- Automated onboarding
- Basic analytics

### Medium Term (Months 4-6)
- 20-50 properties
- Self-service signup
- Advanced features

### Long Term (Year 1+)
- 100+ properties
- Multi-region deployment
- Enterprise features

---

## 🎯 Success Metrics

### Technical Metrics
- Query response time < 200ms
- 99.9% uptime
- Zero data leakage between properties
- < 5 second page load time

### Business Metrics
- Onboarding time < 30 minutes
- Customer churn < 5%
- MRR growth > 20% monthly
- Support tickets < 2 per property/month

---

## 🔒 Security Layers

```
Layer 1: Subdomain Detection
         ↓ (Extract property context)
         
Layer 2: Property Lookup
         ↓ (Verify property exists & active)
         
Layer 3: Query Filtering
         ↓ (All queries filter by property_id)
         
Layer 4: Row Level Security
         ↓ (Database-level policies)
         
Layer 5: API Authentication
         ↓ (Supabase auth + service role)
         
Layer 6: Rate Limiting
         ↓ (Prevent abuse)
```

---

This architecture provides:
- ✅ Complete data isolation
- ✅ Scalable to 100+ properties
- ✅ Single codebase deployment
- ✅ Plan-based feature gating
- ✅ Subscription billing ready
- ✅ Easy onboarding
- ✅ Cost-effective infrastructure
