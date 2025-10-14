# API Response Format Reference

## Issue Fixed: getCurrentEducator Response Structure

### Problem
The frontend was trying to access `response.data.id` but the backend returns a different structure.

**Error:**
```
TypeError: Cannot read properties of undefined (reading 'id')
```

### Backend Response Format

**File:** `src/controllers/AuthController.js`

**Endpoint:** `GET /api/auth/educator/me`

**Response:**
```javascript
{
  educator: {
    _id: "68c3d79be5d001b55ffce034",
    firstName: "abhishek",
    lastName: "jewels",
    email: "teacher1@gmail.com",
    mobileNumber: "1245789632",
    bio: "sdfdsfd asdfasf dasfdf",
    specialization: "IIT-JEE",
    subject: "physics",
    yearsExperience: 0,
    image: {
      url: "https://..."
    },
    introVideoLink: "https://youtu.be/...",
    socials: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
      youtube: ""
    },
    workExperience: [...],
    qualification: [...],
    courses: [...],
    webinars: [...],
    testSeries: [...],
    // ... other fields
    // NOTE: password is excluded via .select('-password')
  }
}
```

### Frontend Fix

**Before (Incorrect):**
```typescript
const response = await getCurrentEducator();
const educator = response.data;  // ❌ Wrong - data doesn't exist
setEducatorId(educator.id);       // ❌ Wrong - should be _id
```

**After (Correct):**
```typescript
const response = await getCurrentEducator();
const educator = response.educator;  // ✅ Correct
setEducatorId(educator._id);         // ✅ Correct - MongoDB uses _id
```

### Key Points

1. **Response Structure:**
   - Backend returns: `{ educator: {...} }`
   - NOT: `{ data: {...} }`

2. **ID Field:**
   - MongoDB uses `_id` (with underscore)
   - NOT `id` (without underscore)

3. **Backend Code:**
   ```javascript
   const getCurrentEducator = async (req, res) => {
     const educatorId = req.user.userid;
     const educator = await Educator.findById(educatorId)
       .select('-password');
     return res.status(200).json({ educator }); // Returns { educator: {...} }
   };
   ```

4. **Frontend API Call:**
   ```javascript
   export const getCurrentEducator = async () => {
     const response = await API_CLIENT.get("/api/auth/educator/me", {
       headers: getAuthHeaders(),
     });
     return response.data; // Axios automatically extracts response.data
   };
   ```
   - Axios returns the response body in `response.data`
   - Backend sends `{ educator: {...} }`
   - So frontend gets: `{ educator: {...} }` in `response.data`
   - Access educator with: `response.data.educator` OR just `response.educator` (since we return response.data)

### Other API Response Formats to Check

**Common Patterns in the Backend:**

1. **Success Response:**
   ```javascript
   res.status(200).json({ 
     success: true,
     message: "Operation successful",
     data: {...}
   });
   ```

2. **Direct Object Response:**
   ```javascript
   res.status(200).json({ educator: {...} });
   res.status(200).json({ course: {...} });
   res.status(200).json({ testSeries: {...} });
   ```

3. **Array Response:**
   ```javascript
   res.status(200).json({ 
     courses: [...],
     total: 10
   });
   ```

### Recommendations

1. **Always console.log the response first:**
   ```typescript
   const response = await getCurrentEducator();
   console.log("Response:", response);
   ```

2. **Check backend controller to see exact response structure**

3. **Use TypeScript interfaces for better type safety:**
   ```typescript
   interface GetEducatorResponse {
     educator: {
       _id: string;
       firstName: string;
       lastName: string;
       email: string;
       // ... other fields
     }
   }
   ```

4. **Add error handling for undefined properties:**
   ```typescript
   const educator = response?.educator;
   if (!educator) {
     throw new Error("Educator data not found in response");
   }
   ```

### Fixed Files

- ✅ `app/dashboard/settings/page.tsx` - Line 88-89
  - Changed: `response.data` → `response.educator`
  - Changed: `educator.id` → `educator._id`

### Testing

1. Login to dashboard
2. Navigate to Settings page
3. Should load profile data without errors
4. Console should show educator object with all fields
5. All form fields should be populated with current data

---

## Similar Issues to Watch For

If you encounter similar errors in other parts of the application, check:

1. **Response structure** - Does backend return `{ data: {...} }` or `{ [resourceName]: {...} }`?
2. **ID field** - MongoDB uses `_id`, not `id`
3. **Axios behavior** - Remember axios.get returns `response.data` which contains the actual backend response
4. **Optional chaining** - Use `?.` to safely access nested properties

Example:
```typescript
// Safe access
const imageUrl = educator?.image?.url || "/default-avatar.png";
const firstName = educator?.firstName || "Unknown";
```
