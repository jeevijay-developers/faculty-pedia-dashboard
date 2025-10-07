# Test Bank Implementation

## Overview

This implementation provides a comprehensive test bank system for educators to create and manage live tests with question selection from their question bank.

## Components Created

### 1. Main Test Bank Page (`/app/dashboard/create-test/page.tsx`)

- **Location**: `app/dashboard/create-test/page.tsx`
- **Features**:
  - Displays all tests created by the educator
  - "Create New Test" button to open test creation dialog
  - Test cards showing title, subject, specialization, duration, questions count
  - Action buttons for View, Edit, Delete (Edit/Delete disabled for now)
  - Authentication check - redirects to login if educator not authenticated
  - Loading states and error handling

### 2. Create Test Dialog (`/components/create-test-dialog.tsx`)

- **Location**: `components/create-test-dialog.tsx`
- **Features**:
  - Two-step wizard for test creation
  - **Step 1**: Basic test information
    - Title, short description, long description
    - Subject selection (Physics, Chemistry, Mathematics, Mixed)
    - Specialization (IIT-JEE, NEET, CBSE)
    - Start date/time, duration
    - Marking scheme (positive/negative marks)
  - **Step 2**: Question selection using QuestionBank component
  - Form validation at each step
  - API integration for test creation

### 3. Question Bank Component (`/components/question-bank.tsx`)

- **Location**: `components/question-bank.tsx`
- **Features**:
  - Reusable component for question selection
  - Search functionality by question title, topic, or subject
  - Filter by subject and topic
  - Checkbox selection for multiple questions
  - Question cards showing title, subject, topic, marks, and all options
  - Correct answer display
  - Selection summary with count

### 4. TypeScript Interfaces (`/lib/types/test.ts`)

- **Location**: `lib/types/test.ts`
- **Interfaces**:
  - `Question`: Structure for question data
  - `QuestionsResponse`: API response for questions
  - `Test`: Structure for test data
  - `TestsResponse`: API response for tests
  - `CreateTestData`: Data structure for test creation

### 5. API Integration (`/util/server.js`)

- Added new functions:
  - `getEducatorQuestionsByEducatorId(educatorId)`: Fetch questions by educator
  - `getEducatorTests(educatorId)`: Fetch tests by educator
  - `createLiveTest(testData)`: Create new live test

## API Endpoints Used

### Questions API

```bash
GET /api/questions/educator/{educatorId}
```

- Fetches all questions created by the educator
- Response includes questions array and pagination

### Tests API

```bash
GET /api/live-test/educator/{educatorId}
```

- Fetches all tests created by the educator
- Response includes tests array with populated question details

```bash
POST /api/live-test/create-test
```

- Creates a new live test
- Requires authorization header
- Body includes test details and selected question IDs

## User Flow

1. **View Tests**: User sees all their existing tests on the main page
2. **Create Test**: Click "Create New Test" button
3. **Step 1 - Basic Info**: Fill test details (title, subject, dates, etc.)
4. **Step 2 - Select Questions**: Browse and select questions from their question bank
5. **Submit**: Test is created and user returns to main page

## Features

### Authentication

- Uses `useAuth` hook to get educator information
- Redirects to login page if educator is not authenticated
- All API calls include authorization headers

### Error Handling

- Loading states during API calls
- Error messages for failed operations
- Form validation before proceeding

### UI/UX

- Responsive design with card layouts
- Badge system for categorizing subjects
- Search and filter functionality
- Step-by-step wizard interface
- Loading indicators and disabled states

### Filtering & Search

- Search questions by title, topic, or subject
- Filter by subject (Physics, Chemistry, Mathematics, etc.)
- Filter by topic
- Real-time filtering with useEffect

## Configuration Notes

1. **TypeScript Configuration**:

   - Modified `tsconfig.json` to exclude Mongoose schema files
   - Created frontend-specific type definitions

2. **File Structure**:
   - Components in `/components`
   - Types in `/lib/types`
   - API utilities in `/util`
   - Pages in `/app/dashboard`

## Future Enhancements

1. **Edit Test**: Implement test editing functionality
2. **Delete Test**: Implement test deletion with confirmation
3. **Bulk Question Operations**: Select all/none buttons
4. **Question Preview**: Detailed question preview modal
5. **Test Analytics**: Add statistics and analytics for tests
6. **Duplicate Test**: Clone existing tests
7. **Export/Import**: Export test configurations

## Dependencies

- Next.js 14+ with App Router
- React hooks (useState, useEffect)
- UI components from shadcn/ui
- Lucide React for icons
- Custom authentication context

The implementation follows React best practices with proper state management, error boundaries, and reusable components.
