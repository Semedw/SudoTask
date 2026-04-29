# Available API Functions

## Authentication (`lib/api/auth.ts`)
- `register(payload)` - Register a new user and set auth cookies
- `login(payload)` - Login user and set auth cookies
- `getMe()` - Get current authenticated user profile
- `updateProfile(data)` - Update current user profile
- `logout()` - Logout user (clear auth cookies)

## Classrooms (`lib/api/classes.ts`)
- `getClasses()` - Get list of user's classrooms
- `createClass(payload)` - Create a new classroom (teacher only)
- `getClass(classId)` - Get classroom details by ID
- `updateClass(classId, payload)` - Update classroom (teacher only)
- `deleteClass(classId)` - Delete classroom (teacher only)
- `regenerateClassCode(classId)` - Regenerate classroom join code (teacher only)
- `joinClass(payload)` - Join a classroom with class code (student only)
- `getLeaderboard(classId)` - Get classroom leaderboard
- `getClassAnalytics(classId)` - Get classroom analytics (teacher only)

## Tasks (`lib/api/tasks.ts`)
- `getTasks(classId?)` - Get all tasks, optionally filtered by class
- `getTask(id)` - Get single task details
- `createTask(payload)` - Create new task (teacher only)
- `updateTask(id, payload)` - Update task (teacher only)
- `deleteTask(id)` - Delete task (teacher only)
- `getTestCases(taskId)` - Get test cases for a task
- `addTestCase(taskId, payload)` - Add test case to task (teacher only)
- `updateTestCase(id, payload)` - Update test case (teacher only)
- `deleteTestCase(id)` - Delete test case (teacher only)

## Submissions (`lib/api/submissions.ts`)
- `submitCode(taskId, payload)` - Submit code for grading
- `testCode(taskId, payload)` - Test code against visible test cases (returns results immediately)
- `getSubmission(id)` - Get single submission details
- `getSubmissions(taskId?)` - Get all submissions, optionally filtered by task
- `pollSubmission(id, maxAttempts?)` - Poll submission status until complete

## Client Utilities (`lib/api/client.ts`)
- `api.get(endpoint, options)` - Make GET request
- `api.post(endpoint, data, options)` - Make POST request
- `api.put(endpoint, data, options)` - Make PUT request
- `api.patch(endpoint, data, options)` - Make PATCH request
- `api.delete(endpoint, options)` - Make DELETE request
- `unwrapPaginated(data)` - Normalize paginated DRF responses

## Usage Example

```typescript
// Import specific functions
import { login, register } from "@/lib/api/auth";
import { getClasses, joinClass } from "@/lib/api/classes";
import { getTasks, getTask } from "@/lib/api/tasks";
import { submitCode, testCode } from "@/lib/api/submissions";

// Or import everything
import * as api from "@/lib/api";

// Login
const response = await login({ email: "student@example.com", password: "pass123" });

// Get classes
const classes = await getClasses();

// Test code before submitting
const testResult = await testCode(taskId, { code, language: "python" });
console.log(`Passed: ${testResult.passed_tests}/${testResult.total_tests}`);

// Submit code
const submission = await submitCode(taskId, { code, language: "python" });
```

## Features Added

### Test Button in Solve Page
- Added "Test" button alongside "Submit" button
- Tests code against visible test cases before official submission
- Shows detailed results for each test case (input, expected output, actual output, errors)
- Results displayed in a separate tab with color-coded pass/fail indicators

### Error Handling
- All API functions throw properly structured errors with `message`, `status`, and optional `fieldErrors`
- Frontend components handle API errors gracefully with toast notifications
- Array safety checks in dashboard to prevent `.filter is not a function` errors

### Token / Session Management
- Cookie-based auth (`credentials: include`) with httpOnly auth cookies
- Automatic refresh call on 401 responses
- Automatic redirect to login when refresh fails
