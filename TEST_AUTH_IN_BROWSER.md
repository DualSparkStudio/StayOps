# Test Authentication in Browser

Open your browser console while on `/admin/qr-codes` and run these commands:

## 1. Check if you're logged in
```javascript
const { data: { user }, error } = await supabase.auth.getUser()
console.log('User:', user)
console.log('Error:', error)
```

**Expected:** Should show your user object with an ID
**If null:** You're not logged in - go to `/login` and log in first

## 2. Check the session
```javascript
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
console.log('Access Token:', session?.access_token ? 'EXISTS' : 'MISSING')
```

**Expected:** Should show a session with an access_token
**If null:** Your session expired - log out and log back in

## 3. Test a simple query
```javascript
const { data, error } = await supabase
  .from('service_categories')
  .select('*')
  .limit(1)

console.log('Data:', data)
console.log('Error:', error)
```

**Expected:** Should return data
**If error:** Shows the actual error message

## 4. Test inserting a QR code
```javascript
const { data, error } = await supabase
  .from('room_qr_codes')
  .insert({
    property_id: 1,
    room_id: 1,
    qr_code_data: 'TEST-' + Date.now(),
    generated_at: new Date().toISOString()
  })
  .select()

console.log('Insert result:', data)
console.log('Insert error:', error)
```

**Expected:** Should insert successfully
**If error:** This is the actual problem

---

## Common Issues:

1. **Not logged in** - Go to `/login` and log in
2. **Session expired** - Log out and log back in
3. **Wrong user** - Make sure you're logged in as an admin user
4. **CORS issue** - Check if Supabase URL is correct in .env

## If all tests pass but QR generation still fails:

The issue is in the QR code generation logic, not authentication.
Check the browser console for the actual error when clicking "Generate All".
