export type UserRole = "TEACHER" | "STUDENT"

export interface User {
  id: number
  email: string
  username: string
  role: UserRole
  first_name: string
  last_name: string
  created_at: string
}

export interface ClassRoom {
  id: number
  teacher: User
  name: string
  description: string
  class_code: string
  created_at: string
  student_count: number
  task_count: number
}

export interface ClassMembership {
  id: number
  classroom: ClassRoom
  student: User
  joined_at: string
}

export interface Task {
  id: number
  classroom: ClassRoom
  title: string
  description: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  tags: string[]
  created_at: string
  deadline: string | null
  criteria: Criteria[]
  testcases: TestCase[]
  submission_count: number
  testcase_count?: number
}

export interface Criteria {
  id: number
  task: number
  name: string
  points: number
  description: string
}

export interface TestCase {
  id: number
  task: number
  input_data: string
  expected_output: string | null
  is_hidden: boolean
  weight_points: number
  order: number
}

export type Language = "python" | "cpp" | "java"

export interface Submission {
  id: number
  task: Task
  student: User
  language: Language
  code: string
  status: "pending" | "running" | "passed" | "failed" | "error"
  score: number
  passed_count: number
  total_count: number
  created_at: string
  execution_time_ms: number | null
  memory_kb: number | null
  stdout: string
  stderr: string
  test_results: SubmissionTestResult[]
}

export interface SubmissionTestResult {
  id: number
  testcase: TestCase
  passed: boolean
  student_output: string
  expected_output: string
  stderr: string
  runtime_ms: number | null
}

export interface TestCodeResponse {
  results: {
    testcase: TestCase
    passed: boolean
    student_output: string
    expected_output: string
    stderr: string
    runtime_ms: number
  }[]
  total_tests: number
  passed_tests: number
}

export interface LeaderboardEntry {
  student__id: number
  student__email: string
  student__username: string
  total_score: number
  submission_count: number
  passed_count: number
}

export interface ClassAnalytics {
  classroom: ClassRoom
  total_students: number
  total_tasks: number
  total_submissions: number
  average_score: number
  submission_status_breakdown: {
    pending: number
    running: number
    passed: number
    failed: number
    error: number
  }
  tasks: {
    id: number
    title: string
    submission_count: number
    average_score: number
    pass_rate: number
  }[]
}

export interface ApiError {
  message: string
  status: number
  fieldErrors?: Record<string, string[]>
}
