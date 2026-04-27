// Mock data for development and static pages

export const summaryStats = {
  totalClasses: 3,
  totalStudents: 45,
  totalTasks: 12,
  totalSubmissions: 234,
  pendingSubmissions: 8,
  averagePassRate: 72,
}

export const classes = [
  {
    id: 1,
    name: "Introduction to Python",
    description: "Learn Python programming fundamentals",
    class_code: "PY101",
    student_count: 25,
    task_count: 5,
    studentCount: 25,
    taskCount: 5,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "Data Structures",
    description: "Advanced data structures and algorithms",
    class_code: "DS201",
    student_count: 15,
    task_count: 4,
    studentCount: 15,
    taskCount: 4,
    created_at: "2025-02-01T10:00:00Z",
  },
  {
    id: 3,
    name: "Web Development",
    description: "Full-stack web development with JavaScript",
    class_code: "WD301",
    student_count: 5,
    task_count: 3,
    studentCount: 5,
    taskCount: 3,
    created_at: "2025-02-10T10:00:00Z",
  },
]

export const recentSubmissions = [
  {
    id: 1,
    student: "Alice Student",
    studentName: "Alice Student",
    task: "Sum Two Numbers",
    taskName: "Sum Two Numbers",
    className: "Introduction to Python",
    status: "passed" as const,
    score: 100,
    language: "python",
    created_at: "2025-02-20T14:30:00Z",
    submittedAt: "Feb 20, 2025",
  },
  {
    id: 2,
    student: "Bob Student",
    studentName: "Bob Student",
    task: "Fibonacci Sequence",
    taskName: "Fibonacci Sequence",
    className: "Introduction to Python",
    status: "failed" as const,
    score: 40,
    language: "python",
    created_at: "2025-02-20T13:15:00Z",
    submittedAt: "Feb 20, 2025",
  },
  {
    id: 3,
    student: "Charlie Student",
    studentName: "Charlie Student",
    task: "String Reversal",
    taskName: "String Reversal",
    className: "Data Structures",
    status: "passed" as const,
    score: 85,
    language: "cpp",
    created_at: "2025-02-20T12:00:00Z",
    submittedAt: "Feb 20, 2025",
  },
  {
    id: 4,
    student: "Diana Student",
    studentName: "Diana Student",
    task: "Binary Search",
    taskName: "Binary Search",
    className: "Data Structures",
    status: "failed" as const,
    score: 0,
    language: "java",
    created_at: "2025-02-20T11:45:00Z",
    submittedAt: "Feb 20, 2025",
  },
  {
    id: 5,
    student: "Eve Student",
    studentName: "Eve Student",
    task: "Sum Two Numbers",
    taskName: "Sum Two Numbers",
    className: "Introduction to Python",
    status: "passed" as const,
    score: 90,
    language: "python",
    created_at: "2025-02-20T10:30:00Z",
    submittedAt: "Feb 20, 2025",
  },
]

export const solveTaskData = {
  id: 1,
  title: "Sum Two Numbers",
  description:
    "Write a program that reads two integers from standard input and prints their sum.",
  difficulty: "EASY",
  tags: ["python", "math", "basics"],
  starterCode: `# Read two integers and print their sum\na, b = map(int, input().split())\nprint(a + b)`,
  testcases: [
    {
      id: 1,
      input_data: "2 3",
      expected_output: "5",
      is_hidden: false,
      weight_points: 10,
      order: 1,
    },
    {
      id: 2,
      input_data: "0 0",
      expected_output: "0",
      is_hidden: false,
      weight_points: 10,
      order: 2,
    },
    {
      id: 3,
      input_data: "-1 5",
      expected_output: "4",
      is_hidden: true,
      weight_points: 20,
      order: 3,
    },
  ],
  testCases: [
    { id: 1, input: "2 3", expected: "5", expectedOutput: "5", studentOutput: "5", passed: true, points: 10 },
    { id: 2, input: "0 0", expected: "0", expectedOutput: "0", studentOutput: "0", passed: true, points: 10 },
    { id: 3, input: "-1 5", expected: "4", expectedOutput: "4", studentOutput: "3", passed: false, points: 20 },
  ],
}

export const teacherProfile = {
  id: 1,
  email: "teacher@example.com",
  username: "teacher",
  role: "TEACHER",
  first_name: "Demo",
  last_name: "Teacher",
  name: "Demo Teacher",
  organization: "SudoTask University",
}

export const studentProfile = {
  id: 2,
  email: "student1@example.com",
  username: "student1",
  role: "STUDENT",
  first_name: "Alice",
  last_name: "Student",
}

export const taskCompletionData = [
  { name: "Sum Two Numbers", completed: 20, total: 25 },
  { name: "Fibonacci Sequence", completed: 12, total: 25 },
  { name: "String Reversal", completed: 18, total: 25 },
  { name: "Binary Search", completed: 8, total: 25 },
  { name: "Linked List", completed: 5, total: 15 },
]

export const failedTestCasesData = [
  { name: "Test 1", failures: 5 },
  { name: "Test 2", failures: 12 },
  { name: "Test 3 (hidden)", failures: 18 },
  { name: "Test 4 (hidden)", failures: 22 },
]

export const studentPerformanceData = [
  { name: "Week 1", avgScore: 65 },
  { name: "Week 2", avgScore: 70 },
  { name: "Week 3", avgScore: 72 },
  { name: "Week 4", avgScore: 78 },
  { name: "Week 5", avgScore: 82 },
  { name: "Week 6", avgScore: 85 },
]

export const studentAnalyticsTable = [
  {
    name: "Alice Student",
    email: "student1@example.com",
    submissions: 15,
    passed: 12,
    avgScore: 85,
    score: 85,
    mostFailed: "Fibonacci Sequence",
    lastSubmission: "2025-02-20",
  },
  {
    name: "Bob Student",
    email: "student2@example.com",
    submissions: 10,
    passed: 6,
    avgScore: 60,
    score: 60,
    mostFailed: "Binary Search",
    lastSubmission: "2025-02-19",
  },
  {
    name: "Charlie Student",
    email: "student3@example.com",
    submissions: 8,
    passed: 7,
    avgScore: 88,
    score: 88,
    mostFailed: "Linked List",
    lastSubmission: "2025-02-20",
  },
  {
    name: "Diana Student",
    email: "student4@example.com",
    submissions: 12,
    passed: 9,
    avgScore: 75,
    score: 75,
    mostFailed: "String Reversal",
    lastSubmission: "2025-02-18",
  },
  {
    name: "Eve Student",
    email: "student5@example.com",
    submissions: 5,
    passed: 3,
    avgScore: 55,
    score: 55,
    mostFailed: "Sum Two Numbers",
    lastSubmission: "2025-02-17",
  },
]
