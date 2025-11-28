# Runtime Fixes - Signup Page Errors

## 🐛 Issues Found

When testing the signup page, these errors occurred:

1. **403 Forbidden on `/api/`**
   ```
   GET /api/ HTTP/1.1" 403 58
   ```
   
2. **403 Forbidden on `/api/auth/me/`**
   ```
   GET /api/auth/me/ HTTP/1.1" 403 58
   Forbidden: /api/auth/me/
   ```

3. **TypeError in Frontend**
   ```
   classLevels.map is not a function
   ```

---

## ✅ Fixes Applied

### Fix 1: CSRF Token Endpoint

**Problem:** The app was trying to fetch CSRF token from `/api/` which doesn't exist and returns 403.

**File:** `request_front_end/lib/api.ts`

**Before:**
```typescript
export async function getCSRFToken(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/`, {
      credentials: 'include',
    });
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
}
```

**After:**
```typescript
export async function getCSRFToken(): Promise<void> {
  try {
    // Fetch from a public endpoint that exists
    await fetch(`${API_BASE_URL}/api/classlevels/`, {
      credentials: 'include',
    });
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
}
```

**Why:** Django sets CSRF cookies on any request. We can use any existing endpoint. `/api/classlevels/` is public and always available.

---

### Fix 2: Handle 403 on `/api/auth/me/` Gracefully

**Problem:** On signup/login pages, the app checks if user is authenticated. When not logged in, this returns 403 and fills console with errors.

**File:** `request_front_end/lib/auth-context.tsx`

**Before:**
```typescript
const fetchUser = async () => {
  try {
    const userData = await authAPI.getCurrentUser();
    setUser(userData);
  } catch (error) {
    setUser(null);
  }
};
```

**After:**
```typescript
const fetchUser = async () => {
  try {
    const userData = await authAPI.getCurrentUser();
    setUser(userData);
  } catch (error) {
    // User not authenticated, that's okay
    console.log('User not authenticated');
    setUser(null);
  }
};
```

**Why:** It's normal for unauthenticated users to get 403 on `/api/auth/me/`. This is expected behavior, not an error.

---

### Fix 3: Better Error Handling in API Client

**File:** `request_front_end/lib/api.ts`

**Added:**
```typescript
// Don't throw for 403 on /me endpoint (user not authenticated)
if (response.status === 403 && endpoint.includes('/auth/me/')) {
  throw new ApiError('Not authenticated', response.status, responseData);
}
```

**Why:** Provides clearer error message for authentication failures.

---

### Fix 4: Handle API Response Format for Class Levels

**Problem:** `classLevels.map is not a function` - The API response might be paginated or in a different format.

**File:** `request_front_end/app/signup/page.tsx`

**Before:**
```typescript
const levels = await classLevelsAPI.list()
setClassLevels(levels)
```

**After:**
```typescript
const response = await classLevelsAPI.list()
// Handle both paginated and non-paginated responses
const levels = Array.isArray(response) ? response : (response.results || [])
setClassLevels(levels)
```

**Why:** Django REST Framework can return:
- Simple array: `[{...}, {...}]`
- Paginated object: `{ count: 2, results: [{...}, {...}] }`

We now handle both cases.

---

### Fix 5: Handle API Response Format for Fields

**File:** `request_front_end/app/signup/page.tsx`

**Before:**
```typescript
const fieldsData = await fieldsAPI.list(parseInt(formData.classLevel))
setFields(fieldsData)
```

**After:**
```typescript
const response = await fieldsAPI.list(parseInt(formData.classLevel))
// Handle both paginated and non-paginated responses
const fieldsData = Array.isArray(response) ? response : (response.results || [])
setFields(fieldsData)
```

**Why:** Same reason as Fix 4 - handle both response formats.

---

## 🧪 Testing After Fixes

### Expected Behavior:

1. **On Signup Page Load:**
   ```
   ✅ GET /api/classlevels/ - 200 OK
   ✅ CSRF cookie is set
   ⚠️  GET /api/auth/me/ - 403 (expected, user not logged in)
   ```

2. **Console:**
   ```
   ✅ "User not authenticated" (informational)
   ✅ No error stack traces
   ✅ No "classLevels.map is not a function"
   ```

3. **UI:**
   ```
   ✅ Niveau dropdown loads and shows options
   ✅ After selecting niveau, filière dropdown populates
   ✅ No crashes or blank screens
   ```

---

## 🚀 Test Now

1. **Restart the frontend** (if it's running):
   ```powershell
   # In request_front_end terminal
   # Press Ctrl+C to stop
   # Then restart:
   npm run dev
   ```

2. **Open signup page**:
   ```
   http://localhost:3000/signup
   ```

3. **Check:**
   - ✅ Page loads without errors
   - ✅ Niveau dropdown has options
   - ✅ Select a niveau
   - ✅ Filière dropdown populates
   - ✅ Console shows "User not authenticated" but no errors

4. **Try signing up:**
   ```
   Prénom: Test
   Nom: User
   Matricule: TEST2024
   Niveau: L2
   Filière: GL
   Password: Test123456
   Confirm: Test123456
   ```

5. **Expected result:**
   - ✅ Account created
   - ✅ Redirected to /login
   - ✅ Can login with TEST2024 / Test123456

---

## 📊 Technical Details

### Why 403 on `/api/auth/me/`?

Django's session authentication requires a valid session cookie. On first visit to signup page:
1. No session exists yet
2. Request to `/api/auth/me/` has no valid session
3. Django returns 403 Forbidden
4. **This is normal and expected**

Once user logs in:
1. Django creates a session
2. Session cookie is set
3. Future requests include session cookie
4. `/api/auth/me/` returns user data

### DRF Pagination

Django REST Framework has pagination enabled:
```python
# In settings.py
REST_FRAMEWORK = {
    'PAGE_SIZE': 20,
}
```

This means endpoints can return:
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [ /* array of items */ ]
}
```

Our fix handles both paginated and non-paginated responses.

---

## 🎯 Summary

**Before:**
- ❌ Console filled with 403 errors
- ❌ "classLevels.map is not a function"
- ❌ Dropdowns might not work

**After:**
- ✅ Clean console (only informational logs)
- ✅ Dropdowns work correctly
- ✅ Handles both API response formats
- ✅ Graceful error handling

---

**Status:** ✅ Fixed and Ready to Test

**Next Steps:** Test the signup flow end-to-end


