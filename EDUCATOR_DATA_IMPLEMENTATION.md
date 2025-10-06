# Educator Data Implementation Guide

## Overview
This document explains how educator data is managed dynamically in the Faculty Pedia dashboard using localStorage and API calls.

## Data Storage Structure

### LocalStorage Keys
1. **`faculty-pedia-auth-token`**: JWT authentication token
2. **`faculty-pedia-educator-data`**: Complete educator profile data (JSON)
3. **`user-role`**: User role identifier ("educator")

### Educator Data Structure
```typescript
{
  _id: string
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  bio?: string
  image?: { url: string }
  specialization: string  // e.g., "IIT-JEE", "NEET", "CBSE"
  subject: string         // e.g., "Physics", "Chemistry", "Mathematics"
  qualification: Array<{
    title: string
    institute: string
    startDate: string
    endDate?: string
  }>
  workExperience: Array<{
    title: string
    company: string
    startDate: string
    endDate?: string
  }>
  yearsExperience: number
  rating: number
  payPerHourFees: number
  status: string          // "active", "inactive"
  role: string           // "educator"
  slug: string
  socials: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    youtube?: string
  }
  courses: string[]      // Array of course IDs
  questions: string[]    // Array of question IDs
  testSeries: string[]   // Array of test series IDs
  webinars: string[]     // Array of webinar IDs
  liveTests: string[]    // Array of live test IDs
  followers: string[]    // Array of student IDs
  createdAt: string
  updatedAt: string
}
```

## Implementation Details

### 1. Auth Context (`contexts/auth-context.tsx`)

The auth context manages the global educator state and provides helper methods:

**Key Features:**
- Automatically loads educator data from localStorage on mount
- Provides `educator` object to all components
- `getFullName()`: Returns formatted full name
- `updateEducator()`: Updates educator data in state and localStorage
- `login()`: Saves token and educator data
- `logout()`: Clears all data and redirects

**Usage Example:**
```typescript
import { useAuth } from "@/contexts/auth-context"

function MyComponent() {
  const { educator, getFullName, isAuthenticated } = useAuth()
  
  return (
    <div>
      <h1>Welcome, {getFullName()}</h1>
      <p>Email: {educator?.email}</p>
      <p>Specialization: {educator?.specialization}</p>
    </div>
  )
}
```

### 2. API Service Layer (`util/server.js`)

All API calls are centralized in `server.js` for clean and organized code.

**Helper Functions:**
- `getAuthToken()`: Retrieves token from localStorage
- `getAuthHeaders()`: Returns authorization headers with token

**Available API Methods:**

#### Authentication
- `loginEducator(email, password)`: Login and get token + educator data

#### Profile Management
- `getEducatorProfile()`: Fetch current educator profile
- `updateEducatorProfile(data)`: Update educator profile

#### Courses
- `getEducatorCourses()`: Get all courses by educator
- `createCourse(courseData)`: Create new course
- `updateCourse(courseId, courseData)`: Update existing course
- `deleteCourse(courseId)`: Delete a course

#### Question Bank
- `getEducatorQuestions()`: Get all questions
- `createQuestion(questionData)`: Create new question
- `updateQuestion(questionId, questionData)`: Update question
- `deleteQuestion(questionId)`: Delete question

#### Test Series
- `getEducatorTestSeries()`: Get all test series
- `createTestSeries(testSeriesData)`: Create test series
- `updateTestSeries(testSeriesId, testSeriesData)`: Update test series
- `deleteTestSeries(testSeriesId)`: Delete test series

#### Live Classes
- `getEducatorLiveClasses()`: Get all live classes
- `createLiveClass(liveClassData)`: Create live class
- `updateLiveClass(liveClassId, liveClassData)`: Update live class
- `deleteLiveClass(liveClassId)`: Delete live class

#### Webinars
- `getEducatorWebinars()`: Get all webinars
- `createWebinar(webinarData)`: Create webinar
- `updateWebinar(webinarId, webinarData)`: Update webinar
- `deleteWebinar(webinarId)`: Delete webinar

#### Students
- `getEducatorStudents()`: Get all enrolled students

#### Dashboard
- `getDashboardStats()`: Get dashboard statistics

**Usage Example:**
```typescript
import { getEducatorCourses, createCourse } from "@/util/server"

async function loadCourses() {
  try {
    const response = await getEducatorCourses()
    console.log("Courses:", response.courses)
  } catch (error) {
    console.error("Failed to load courses:", error)
  }
}

async function addCourse() {
  try {
    const newCourse = {
      title: "Advanced Physics",
      description: "Complete physics course",
      price: 5000,
      // ... other fields
    }
    const response = await createCourse(newCourse)
    console.log("Course created:", response.course)
  } catch (error) {
    console.error("Failed to create course:", error)
  }
}
```

### 3. Dashboard Sidebar (`components/dashboard-sidebar.tsx`)

The sidebar dynamically displays educator information:

**Dynamic Features:**
- Shows educator's profile image or initials
- Displays full name (firstName + lastName)
- Shows email address
- All data pulled from auth context

**Key Functions:**
- `getInitials()`: Generates initials from first and last name
- `getProfileImage()`: Returns profile image URL or null
- `getFullName()`: From auth context

### 4. Login Page (`components/login-page.tsx`)

**Updated Features:**
- Handles both `TOKEN` and `token` response formats
- Properly saves educator data to localStorage via auth context
- Shows appropriate error messages
- Auto-redirects to dashboard after successful login

## Best Practices

### 1. Always Use Auth Context
```typescript
// ✅ GOOD
const { educator } = useAuth()
const name = `${educator?.firstName} ${educator?.lastName}`

// ❌ BAD
const data = localStorage.getItem("faculty-pedia-educator-data")
const educator = JSON.parse(data)
```

### 2. Use Server Methods for API Calls
```typescript
// ✅ GOOD
import { getEducatorCourses } from "@/util/server"
const courses = await getEducatorCourses()

// ❌ BAD
const token = localStorage.getItem("faculty-pedia-auth-token")
const response = await axios.get("/api/courses", {
  headers: { Authorization: `Bearer ${token}` }
})
```

### 3. Handle Loading and Error States
```typescript
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  async function loadData() {
    try {
      setLoading(true)
      const response = await getEducatorCourses()
      setCourses(response.courses)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  loadData()
}, [])
```

### 4. Update Context After Profile Changes
```typescript
import { updateEducatorProfile } from "@/util/server"
import { useAuth } from "@/contexts/auth-context"

const { updateEducator } = useAuth()

async function saveProfile(data) {
  try {
    const response = await updateEducatorProfile(data)
    // Update context so UI reflects changes immediately
    updateEducator(response.educator)
  } catch (error) {
    console.error("Failed to update profile:", error)
  }
}
```

## Security Considerations

1. **Token Expiration**: Implement token refresh logic
2. **Protected Routes**: Use `ProtectedRoute` component for dashboard pages
3. **Logout on 401**: Handle unauthorized responses globally
4. **Secure Storage**: Consider using httpOnly cookies for production

## Example: Building a Courses Page

```typescript
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getEducatorCourses, createCourse, deleteCourse } from "@/util/server"
import toast from "react-hot-toast"

export default function CoursesPage() {
  const { educator, getFullName } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
    try {
      setLoading(true)
      const response = await getEducatorCourses()
      setCourses(response.courses)
    } catch (error) {
      toast.error("Failed to load courses")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCourse(courseData) {
    try {
      const response = await createCourse(courseData)
      setCourses([...courses, response.course])
      toast.success("Course created successfully!")
    } catch (error) {
      toast.error("Failed to create course")
      console.error(error)
    }
  }

  async function handleDeleteCourse(courseId) {
    try {
      await deleteCourse(courseId)
      setCourses(courses.filter(c => c._id !== courseId))
      toast.success("Course deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete course")
      console.error(error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Courses by {getFullName()}</h1>
      <p>Specialization: {educator?.specialization}</p>
      
      <div className="courses-grid">
        {courses.map(course => (
          <div key={course._id}>
            <h3>{course.title}</h3>
            <button onClick={() => handleDeleteCourse(course._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Troubleshooting

### Issue: Educator data is null
- Check if localStorage has `faculty-pedia-educator-data`
- Verify you're logged in (check for token)
- Try logging out and logging back in

### Issue: API calls return 401
- Token might be expired
- Check if token is being sent in headers
- Verify backend is running and accessible

### Issue: Data not updating in UI
- Make sure to use `updateEducator()` after profile updates
- Check if you're using the auth context properly
- Verify state is being updated in components

## Next Steps

1. Implement token refresh mechanism
2. Add profile edit functionality
3. Create dashboard statistics page
4. Build courses management UI
5. Add question bank interface
6. Implement test series builder
