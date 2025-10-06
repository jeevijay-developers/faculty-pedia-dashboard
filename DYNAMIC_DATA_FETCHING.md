# Dynamic Educator Data Fetching - Implementation Guide

## Overview
This system fetches educator data directly from the database on each login and provides a refresh mechanism to update data after any modifications. This ensures the dashboard always displays the most up-to-date information.

## Architecture

### Previous Approach (❌ Problem)
```
Login → Save TOKEN + Educator Data to localStorage → Use stale data forever
Problem: When educator adds a course, localStorage still shows old data
```

### New Approach (✅ Solution)
```
Login → Save TOKEN to localStorage → Fetch Educator from API → Store in Context
On Update → Call refreshEducator() → Re-fetch from API → Update Context
```

## Implementation Details

### 1. Backend API Endpoint

**Route**: `GET /api/auth/educator/me`
**File**: `faculty-pedia-backend/src/routes/auth.routes.js`

```javascript
router.get(
  "/auth/educator/me",
  verifyToken,  // Middleware extracts user from token
  getCurrentEducator
);
```

**Controller**: `getCurrentEducator` in `AuthController.js`

```javascript
const getCurrentEducator = async (req, res) => {
  try {
    const educatorId = req.user.userid; // From JWT token
    
    const educator = await Educator.findById(educatorId)
      .select('-password'); // Exclude password
    
    if (!educator) {
      return res.status(404).json({ message: "Educator not found" });
    }
    
    return res.status(200).json({ educator });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
```

**Features**:
- Protected route (requires valid JWT token)
- Excludes password from response
- Returns complete educator object with all relationships
- Error handling for invalid tokens

### 2. Frontend API Service

**File**: `faculty-pedia-dashboard/util/server.js`

```javascript
// Get current educator by token
export const getCurrentEducator = async () => {
  try {
    const response = await API_CLIENT.get("/api/auth/educator/me", {
      headers: getAuthHeaders(), // Automatically includes token
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching current educator:", error);
    throw error;
  }
};
```

### 3. Auth Context (Core Logic)

**File**: `faculty-pedia-dashboard/contexts/auth-context.tsx`

#### Key Changes:

**A. State Management**
```typescript
// OLD: Stored educator data in localStorage
localStorage.setItem("faculty-pedia-educator-data", JSON.stringify(educator))

// NEW: Only token in localStorage, educator in context
localStorage.setItem("faculty-pedia-auth-token", token)
setEducator(educatorFromAPI)
```

**B. Login Function**
```typescript
const login = async (token: string) => {
  // 1. Save token to localStorage
  localStorage.setItem("faculty-pedia-auth-token", token)
  localStorage.setItem("user-role", "educator")
  
  // 2. Fetch educator data from API
  try {
    await fetchEducatorData()
  } catch (error) {
    // If fetch fails, clear token (invalid/expired)
    localStorage.removeItem("faculty-pedia-auth-token")
    localStorage.removeItem("user-role")
    throw error
  }
}
```

**C. Refresh Function** (NEW!)
```typescript
const refreshEducator = async () => {
  try {
    await fetchEducatorData()
  } catch (error) {
    console.error("Failed to refresh educator data:", error)
    throw error
  }
}
```

**D. Auto-fetch on Mount**
```typescript
useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem("faculty-pedia-auth-token")

    if (token) {
      try {
        await fetchEducatorData() // Fetch fresh data
      } catch (error) {
        console.error("Failed to fetch educator on mount:", error)
      }
    }

    setIsLoading(false)
  }

  initAuth()
}, [])
```

### 4. Login Flow

**File**: `faculty-pedia-dashboard/components/login-page.tsx`

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  try {
    const response = await loginEducator(email, password)
    const token = response.TOKEN || response.token
    
    if (token) {
      // login() will fetch educator data automatically
      await login(token)
      toast.success("Login successful! Redirecting...")
    }
  } catch (err) {
    toast.error("Login failed")
  }
}
```

## Usage Guide

### 1. Accessing Educator Data

```typescript
import { useAuth } from "@/contexts/auth-context"

function MyComponent() {
  const { educator, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      <h1>{educator?.firstName} {educator?.lastName}</h1>
      <p>Courses: {educator?.courses?.length}</p>
      <p>Questions: {educator?.questions?.length}</p>
    </div>
  )
}
```

### 2. Refreshing Data After Updates

**When to call `refreshEducator()`:**
- After creating a course
- After adding questions
- After creating test series
- After updating profile
- After any operation that modifies educator data

**Example: After Creating a Course**

```typescript
import { useAuth } from "@/contexts/auth-context"
import { createCourse } from "@/util/server"
import toast from "react-hot-toast"

function CreateCourseForm() {
  const { refreshEducator } = useAuth()
  
  const handleSubmit = async (courseData) => {
    try {
      // 1. Create the course
      await createCourse(courseData)
      
      // 2. Refresh educator data to show new course
      await refreshEducator()
      
      toast.success("Course created successfully!")
    } catch (error) {
      toast.error("Failed to create course")
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

**Example: After Updating Profile**

```typescript
import { useAuth } from "@/contexts/auth-context"
import { updateEducatorProfile } from "@/util/server"

function ProfileSettings() {
  const { educator, refreshEducator } = useAuth()
  
  const handleSave = async (updatedData) => {
    try {
      await updateEducatorProfile(updatedData)
      await refreshEducator() // Fetch updated data
      toast.success("Profile updated!")
    } catch (error) {
      toast.error("Update failed")
    }
  }
  
  return <form onSubmit={handleSave}>...</form>
}
```

### 3. Dashboard Stats (Auto-Updated)

```typescript
function DashboardPage() {
  const { educator } = useAuth()
  
  // These counts are always fresh from DB
  const coursesCount = educator?.courses?.length || 0
  const questionsCount = educator?.questions?.length || 0
  const testSeriesCount = educator?.testSeries?.length || 0
  
  return (
    <div>
      <StatCard title="Courses" value={coursesCount} />
      <StatCard title="Questions" value={questionsCount} />
      <StatCard title="Test Series" value={testSeriesCount} />
    </div>
  )
}
```

## Benefits

### 1. **Always Fresh Data** ✅
- Dashboard shows real-time counts
- No stale data issues
- Accurate statistics

### 2. **Immediate Updates** ✅
- Create course → `refreshEducator()` → See new count instantly
- Add questions → `refreshEducator()` → Updated question count
- Profile changes → `refreshEducator()` → Reflected everywhere

### 3. **Better Security** 🔒
- Password never stored in localStorage
- Token can be invalidated server-side
- Expired tokens handled gracefully

### 4. **Simplified State Management** 🎯
- Single source of truth (API)
- No localStorage sync issues
- Context automatically updates all components

### 5. **Cross-Device Sync** 🔄
- Login on Device A, add course
- Login on Device B, see the course
- No localStorage inconsistencies

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                           │
└─────────────────────────────────────────────────────────┘
User enters credentials
       ↓
POST /api/auth/login-educator
       ↓
Backend returns { TOKEN, educator }
       ↓
Frontend: login(TOKEN)
       ↓
Save TOKEN to localStorage
       ↓
GET /api/auth/educator/me (with token)
       ↓
Backend: Verify token → Fetch educator from DB
       ↓
Frontend: setEducator(data from API)
       ↓
Dashboard displays fresh data

┌─────────────────────────────────────────────────────────┐
│                   UPDATE FLOW                           │
└─────────────────────────────────────────────────────────┘
User creates course
       ↓
POST /api/educator/courses (with token)
       ↓
Backend: Save course → Update educator.courses array
       ↓
Frontend: await createCourse()
       ↓
Frontend: await refreshEducator()
       ↓
GET /api/auth/educator/me (with token)
       ↓
Backend: Return updated educator (with new course)
       ↓
Frontend: setEducator(updated data)
       ↓
Dashboard shows new course count
```

## localStorage Contents

### Before (Old System)
```javascript
{
  "faculty-pedia-auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "faculty-pedia-educator-data": "{\"_id\":\"123\",\"courses\":[],\"questions\":[]}", // ❌ Stale
  "user-role": "educator"
}
```

### After (New System)
```javascript
{
  "faculty-pedia-auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // ✅ Only token
  "user-role": "educator"
}
// Educator data lives in Context, fetched from API
```

## Error Handling

### Invalid/Expired Token
```typescript
const fetchEducatorData = async () => {
  try {
    const response = await getCurrentEducator()
    setEducator(response.educator)
  } catch (error) {
    // Token invalid/expired
    console.error("Error fetching educator data:", error)
    localStorage.removeItem("faculty-pedia-auth-token")
    localStorage.removeItem("user-role")
    setEducator(null)
    throw error
  }
}
```

### Network Errors
```typescript
const { educator, refreshEducator } = useAuth()

const handleUpdate = async () => {
  try {
    await updateSomething()
    await refreshEducator()
  } catch (error) {
    if (error.code === 'ERR_NETWORK') {
      toast.error("Network error. Please check your connection.")
    } else {
      toast.error("Update failed. Please try again.")
    }
  }
}
```

## Migration Checklist

- [x] Backend: Add `getCurrentEducator` controller
- [x] Backend: Add `/api/auth/educator/me` route
- [x] Frontend: Add `getCurrentEducator` API method
- [x] Frontend: Update auth context to fetch from API
- [x] Frontend: Add `refreshEducator` function
- [x] Frontend: Update login flow
- [x] Remove old localStorage educator data references
- [ ] Update course creation to call `refreshEducator()`
- [ ] Update question creation to call `refreshEducator()`
- [ ] Update test series creation to call `refreshEducator()`
- [ ] Update profile updates to call `refreshEducator()`

## Testing

### Test Login Flow
1. Clear localStorage
2. Login with valid credentials
3. Check: Token saved to localStorage
4. Check: Educator data fetched from API
5. Check: Dashboard shows correct counts

### Test Refresh Flow
1. Login
2. Note current course count
3. Add a course via API
4. Call `refreshEducator()`
5. Check: Course count increased

### Test Token Expiry
1. Login
2. Manually expire/delete token in backend
3. Try to refresh
4. Check: User logged out automatically

## Conclusion

This new implementation ensures that the dashboard always displays fresh, accurate data from the database. By fetching educator data on login and providing a refresh mechanism, we eliminate stale data issues while maintaining good performance and security.

**Key Takeaway**: Store authentication credentials, fetch application data! 🚀
