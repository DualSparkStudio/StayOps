# Multi-Tenant Query Patterns - Quick Reference

## 🎯 The Golden Rule
**EVERY database query MUST filter by property_id**

---

## 📦 Import What You Need

```typescript
// For React components
import { usePropertyId, useProperty } from '../contexts/PropertyContext';

// For helper functions
import { requirePropertyId } from '../lib/property-context';

// For pre-built queries
import { 
  roomsQuery, 
  bookingsQuery, 
  blockedDatesQuery,
  attractionsQuery,
  facilitiesQuery,
  testimonialsQuery 
} from '../lib/supabase-multi-tenant';
```

---

## 🔥 Common Patterns

### Pattern 1: Using Pre-Built Query Helpers (RECOMMENDED)

```typescript
import { roomsQuery } from '../lib/supabase-multi-tenant';

// Get all rooms for current property
const { data: rooms, error } = await roomsQuery.getAll();

// Get room by ID
const { data: room, error } = await roomsQuery.getById(roomId);

// Get room by slug
const { data: room, error } = await roomsQuery.getBySlug('deluxe-room');

// Create new room
const { data: newRoom, error } = await roomsQuery.create({
  room_number: '101',
  name: 'Deluxe Room',
  price_per_night: 5000,
  // property_id is added automatically
});

// Update room
const { data: updated, error } = await roomsQuery.update(roomId, {
  price_per_night: 5500
});

// Delete room
const { error } = await roomsQuery.delete(roomId);
```

### Pattern 2: In React Components with Hook

```typescript
import { usePropertyId } from '../contexts/PropertyContext';
import { supabase } from '../lib/supabase';

function MyComponent() {
  const propertyId = usePropertyId();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    async function fetchRooms() {
      if (!propertyId) return;
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('property_id', propertyId)
        .eq('is_active', true);
      
      if (data) setRooms(data);
    }
    
    fetchRooms();
  }, [propertyId]);

  return <div>{/* render rooms */}</div>;
}
```

### Pattern 3: In Utility Functions

```typescript
import { requirePropertyId } from '../lib/property-context';
import { supabase } from '../lib/supabase';

export async function getAvailableRooms(checkIn: string, checkOut: string) {
  const propertyId = requirePropertyId();
  
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true);
  
  return data;
}
```

### Pattern 4: In Netlify Functions

```javascript
// netlify/functions/some-function.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const { propertyId, roomId } = JSON.parse(event.body);
  
  // ALWAYS validate propertyId is provided
  if (!propertyId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'property_id is required' })
    };
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId)
    .eq('id', roomId)
    .single();
  
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
```

---

## 📚 All Available Query Helpers

### Rooms
```typescript
roomsQuery.getAll()
roomsQuery.getById(id)
roomsQuery.getBySlug(slug)
roomsQuery.create(data)
roomsQuery.update(id, data)
roomsQuery.delete(id)
```

### Bookings
```typescript
bookingsQuery.getAll()
bookingsQuery.getById(id)
bookingsQuery.getByDateRange(startDate, endDate)
bookingsQuery.create(data)
bookingsQuery.update(id, data)
```

### Blocked Dates
```typescript
blockedDatesQuery.getAll()
blockedDatesQuery.getByRoomId(roomId)
blockedDatesQuery.create(data)
blockedDatesQuery.delete(id)
```

### Tourist Attractions
```typescript
attractionsQuery.getAll()
attractionsQuery.create(data)
attractionsQuery.update(id, data)
attractionsQuery.delete(id)
```

### Facilities
```typescript
facilitiesQuery.getAll()
facilitiesQuery.create(data)
facilitiesQuery.update(id, data)
facilitiesQuery.delete(id)
```

### Testimonials
```typescript
testimonialsQuery.getAll()
testimonialsQuery.create(data)
testimonialsQuery.update(id, data)
testimonialsQuery.delete(id)
```

---

## 🎨 Access Property Information

```typescript
import { useProperty } from '../contexts/PropertyContext';

function MyComponent() {
  const { property, propertyId, isLoading, error } = useProperty();
  
  if (isLoading) return <div>Loading property...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!property) return <div>No property found</div>;
  
  return (
    <div>
      <h1>{property.name}</h1>
      <p>Plan: {property.plan_type}</p>
      <p>QR Enabled: {property.qr_enabled ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T: Query without property_id
```typescript
// WRONG - No property filter
const { data } = await supabase
  .from('rooms')
  .select('*');
```

### ✅ DO: Always filter by property_id
```typescript
// CORRECT - Using helper
const { data } = await roomsQuery.getAll();

// OR CORRECT - Manual filter
const propertyId = requirePropertyId();
const { data } = await supabase
  .from('rooms')
  .select('*')
  .eq('property_id', propertyId);
```

### ❌ DON'T: Forget property_id when inserting
```typescript
// WRONG - Missing property_id
await supabase.from('rooms').insert({
  name: 'New Room',
  price_per_night: 5000
});
```

### ✅ DO: Include property_id in inserts
```typescript
// CORRECT - Using helper (adds property_id automatically)
await roomsQuery.create({
  name: 'New Room',
  price_per_night: 5000
});

// OR CORRECT - Manual insert
const propertyId = requirePropertyId();
await supabase.from('rooms').insert({
  property_id: propertyId,
  name: 'New Room',
  price_per_night: 5000
});
```

---

## 🧪 Testing in Development

### Simulate Different Properties

```javascript
// In browser console or before app loads
localStorage.setItem('dev_subdomain', 'grandvalley');
location.reload();

// Switch to different property
localStorage.setItem('dev_subdomain', 'testhotel');
location.reload();

// Clear override (use actual subdomain)
localStorage.removeItem('dev_subdomain');
location.reload();
```

---

## 🔐 Feature Gating (Phase 4)

```typescript
import { isFeatureEnabled } from '../lib/property-context';

function QRServiceButton() {
  if (!isFeatureEnabled('qr_enabled')) {
    return null; // Don't show if not enabled
  }
  
  return <button>Order Room Service</button>;
}
```

---

## 📊 Property Context API

```typescript
// Get full property object
const { property } = useProperty();

// Get just the ID (most common)
const propertyId = usePropertyId();

// Check loading state
const { isLoading } = useProperty();

// Check for errors
const { error } = useProperty();

// Refetch property (after updates)
const { refetchProperty } = useProperty();
await refetchProperty();
```

---

## 🎯 Migration Checklist for Each File

When updating a file with database queries:

1. [ ] Import necessary helpers/hooks
2. [ ] Find all `supabase.from()` calls
3. [ ] Add `.eq('property_id', propertyId)` to SELECT queries
4. [ ] Add `property_id` to INSERT queries
5. [ ] Add `.eq('property_id', propertyId)` to UPDATE queries
6. [ ] Add `.eq('property_id', propertyId)` to DELETE queries
7. [ ] Test with multiple properties
8. [ ] Verify data isolation

---

## 💡 Pro Tips

1. **Use query helpers** - They're tested and handle property_id automatically
2. **Check property context early** - Show loading state while property loads
3. **Handle missing property** - Show error if property not found
4. **Cache wisely** - Property is cached in sessionStorage
5. **Test isolation** - Always test with 2+ properties to verify isolation

---

## 🆘 Need Help?

If you see this error:
```
Property context is required but not available
```

**Solution:** Ensure PropertyProvider wraps your app in `main.tsx`

If queries return empty:
```
Check: Is property_id being passed?
Check: Is the data actually associated with this property?
Check: Browser DevTools > Network > Supabase requests
```
