"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Play, Send, Clock, Terminal, Loader2, CheckCircle2, XCircle, AlertCircle, FlaskConical } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { getTask, getTestCases } from "@/lib/api/tasks"
import { submitCode, testCode, pollSubmission } from "@/lib/api/submissions"
import { Task, TestCase, Language, Submission, TestCodeResponse } from "@/lib/types"

const STARTER_CODE: Record<string, string> = {
  python: `# Read input and write your solution here\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Read input and write your solution here\n    return 0;\n}`,
  java: `import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input and write your solution here\n    }\n}`,
}

export default function SolveTaskPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = searchParams.get("taskId")
  
  const [task, setTask] = useState<Task | null>(null)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [language, setLanguage] = useState<Language>("python")
  const [code, setCode] = useState(STARTER_CODE.python)
  const [activeTab, setActiveTab] = useState("description")
  const [submissionResult, setSubmissionResult] = useState<Submission | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [activeRightTab, setActiveRightTab] = useState<"code" | "results">("code")
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestCodeResponse | null>(null)

  // --- localStorage helpers for code persistence ---
  const storageKey = (tid: string | number, lang: string) => `sudotask_code_${tid}_${lang}`

  const saveCode = (tid: string | number, lang: string, value: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey(tid, lang), value)
    }
  }

  const loadCode = (tid: string | number, lang: string): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(storageKey(tid, lang))
    }
    return null
  }

  useEffect(() => {
    if (!taskId) {
      toast.error("No task ID provided")
      router.push("/student")
      return
    }

    const id = parseInt(taskId)
    if (isNaN(id)) {
      toast.error("Invalid task ID")
      router.push("/student")
      return
    }

    async function fetchTaskData() {
      try {
        setIsLoading(true)
        const [taskData, testCasesData] = await Promise.all([
          getTask(id),
          getTestCases(id),
        ])
        setTask(taskData)
        setTestCases(testCasesData.filter(tc => !tc.is_hidden))

        // Restore saved code from localStorage
        const saved = loadCode(id, language)
        if (saved) {
          setCode(saved)
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load task")
        router.push("/student")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaskData()
  }, [taskId, router])

  const handleLanguageChange = (newLang: Language) => {
    // Save current code before switching
    if (taskId) saveCode(taskId, language, code)
    setLanguage(newLang)
    const saved = loadCode(taskId!, newLang)
    setCode(saved ?? STARTER_CODE[newLang] ?? "")
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    if (taskId) saveCode(taskId, language, value)
  }

  const handleTest = async () => {
    if (!task) return
    if (!code.trim()) {
      toast.error("Please write some code before testing")
      return
    }
    try {
      setIsTesting(true)
      setTestResult(null)
      setSubmissionResult(null)
      setActiveRightTab("results")
      const result = await testCode(task.id, { code, language })
      setTestResult(result)
      if (result.passed_tests === result.total_tests) {
        toast.success(`All ${result.total_tests} visible tests passed!`)
      } else {
        toast.error(`${result.passed_tests}/${result.total_tests} visible tests passed`)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to test code")
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = async () => {
    if (!task) return

    if (!code.trim()) {
      toast.error("Please write some code before submitting")
      return
    }

    try {
      setIsSubmitting(true)
      setSubmissionResult(null)
      setTestResult(null)
      if (taskId) saveCode(taskId, language, code)
      const submission = await submitCode(task.id, { code, language })
      toast.success("Code submitted! Evaluating...")
      setIsSubmitting(false)
      setIsPolling(true)
      setActiveRightTab("results")

      const result = await pollSubmission(submission.id, 60, 1500)
      setSubmissionResult(result)
      setIsPolling(false)

      if (result.status === "passed") {
        toast.success(`All tests passed! Score: ${result.score}%`)
      } else if (result.status === "failed") {
        toast.error(`Some tests failed. Score: ${result.score}%`)
      } else {
        toast.error("Submission encountered an error")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit code")
      setIsPolling(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !task) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading task...</p>
        </div>
      </div>
    )
  }

  const difficultyColors = {
    EASY: "bg-success/10 text-success border-success/20",
    MEDIUM: "bg-warning/10 text-warning border-warning/20",
    HARD: "bg-destructive/10 text-destructive border-destructive/20",
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <Link href="/student">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <h1 className="truncate text-sm font-semibold text-foreground">{task.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.deadline && (
            <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <Clock className="h-3 w-3" />
              <span>{new Date(task.deadline).toLocaleDateString()}</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left Panel - Task Description */}
        <div className="flex w-full flex-col border-b border-border lg:w-[400px] lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={difficultyColors[task.difficulty]}>
                    {task.difficulty}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{task.classroom.name}</span>
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">{task.title}</h2>
                <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {task.description}
                </div>
              </div>

              {testCases.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-foreground mb-3">Example Test Cases</h2>
                  <div className="space-y-3">
                    {testCases.map((tc, index) => (
                      <Card key={tc.id} className="border-border">
                        <CardContent className="p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Example {index + 1}</p>
                          <div className="space-y-2 text-xs">
                            <div>
                              <p className="text-muted-foreground mb-1">Input:</p>
                              <pre className="bg-muted p-2 rounded overflow-x-auto">{tc.input_data}</pre>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Expected Output:</p>
                              <pre className="bg-muted p-2 rounded overflow-x-auto">{tc.expected_output}</pre>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor + Results */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
            <div className="flex items-center gap-3">
              <Select value={language} onValueChange={(val) => handleLanguageChange(val as Language)}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                </SelectContent>
              </Select>
              {submissionResult && (
                <Badge
                  variant={submissionResult.status === "passed" ? "default" : "destructive"}
                  className={`gap-1 ${
                    submissionResult.status === "passed"
                      ? "bg-success/10 text-success border-success/20"
                      : ""
                  }`}
                >
                  {submissionResult.status === "passed" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {submissionResult.status === "passed" ? "Passed" : "Failed"}
                  {" "}{submissionResult.score}%
                </Badge>
              )}
              {isPolling && (
                <Badge variant="secondary" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Evaluating...
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border border-border text-xs">
                <button
                  onClick={() => setActiveRightTab("code")}
                  className={`px-3 py-1.5 transition-colors ${
                    activeRightTab === "code"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  } rounded-l-md`}
                >
                  Code
                </button>
                <button
                  onClick={() => setActiveRightTab("results")}
                  className={`px-3 py-1.5 transition-colors ${
                    activeRightTab === "results"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  } rounded-r-md`}
                >
                  Results
                  {submissionResult && (
                    <span className="ml-1">
                      ({submissionResult.passed_count}/{submissionResult.total_count})
                    </span>
                  )}
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleTest}
                disabled={isSubmitting || isPolling || isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Test
                  </>
                )}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="gap-1.5"
                onClick={handleSubmit}
                disabled={isSubmitting || isPolling || isTesting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : isPolling ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Code Tab */}
          {activeRightTab === "code" && (
            <div className="flex-1 overflow-hidden p-4">
              <Textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="h-full w-full resize-none font-mono text-sm"
                placeholder="Write your solution here..."
                disabled={isSubmitting || isPolling}
              />
            </div>
          )}

          {/* Results Tab */}
          {activeRightTab === "results" && (
            <div className="flex-1 overflow-y-auto p-4">
              {!submissionResult && !testResult && !isPolling && !isTesting && (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Send className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Test or submit your code to see results here.</p>
                  </div>
                </div>
              )}

              {(isPolling || isTesting) && !submissionResult && !testResult && (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      {isTesting ? "Testing against visible test cases..." : "Running your code against all test cases..."}
                    </p>
                  </div>
                </div>
              )}

              {/* --- TEST RESULTS (visible tests only) --- */}
              {testResult && !submissionResult && (
                <div className="flex flex-col gap-4">
                  <Card className={`border-2 ${
                    testResult.passed_tests === testResult.total_tests
                      ? "border-success/30 bg-success/5"
                      : "border-warning/30 bg-warning/5"
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {testResult.passed_tests === testResult.total_tests ? (
                            <CheckCircle2 className="h-8 w-8 text-success" />
                          ) : (
                            <AlertCircle className="h-8 w-8 text-warning" />
                          )}
                          <div>
                            <p className="text-lg font-bold text-foreground">
                              {testResult.passed_tests === testResult.total_tests
                                ? "All Visible Tests Passed!"
                                : "Some Visible Tests Failed"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {testResult.passed_tests} of {testResult.total_tests} visible test cases passed
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="gap-1">
                          <FlaskConical className="h-3 w-3" />
                          Test Run
                        </Badge>
                      </div>
                      <Progress
                        value={testResult.total_tests > 0
                          ? (testResult.passed_tests / testResult.total_tests) * 100
                          : 0}
                        className="mt-3 h-2"
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        This only tests visible cases. Submit to run against all (including hidden) test cases.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col gap-2">
                    {testResult.results?.map((result, i) => (
                      <Card
                        key={result.testcase?.id ?? i}
                        className={`border ${
                          result.passed ? "border-success/20" : "border-destructive/20"
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {result.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                              )}
                              <span className="text-sm font-medium">
                                Test Case {result.testcase?.order}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {result.runtime_ms ?? "—"}ms
                            </span>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div>
                              <span className="text-muted-foreground">Input: </span>
                              <pre className="mt-0.5 bg-muted p-1.5 rounded font-mono overflow-x-auto whitespace-pre-wrap">{result.testcase?.input_data}</pre>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expected: </span>
                              <pre className="mt-0.5 bg-muted p-1.5 rounded font-mono overflow-x-auto whitespace-pre-wrap">{result.expected_output}</pre>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Output: </span>
                              <pre className={`mt-0.5 p-1.5 rounded font-mono overflow-x-auto whitespace-pre-wrap ${
                                result.passed ? "bg-success/10" : "bg-destructive/10"
                              }`}>{result.student_output || "(empty)"}</pre>
                            </div>
                            {result.stderr && (
                              <div>
                                <span className="text-destructive font-medium">Error: </span>
                                <pre className="mt-0.5 bg-destructive/10 p-1.5 rounded font-mono overflow-x-auto whitespace-pre-wrap text-destructive">{result.stderr}</pre>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveRightTab("code")}
                    >
                      Back to Code
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={handleSubmit}
                      disabled={isSubmitting || isPolling}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Submit for Full Score
                    </Button>
                  </div>
                </div>
              )}

              {/* --- SUBMISSION RESULTS (all tests) --- */}
              {submissionResult && (
                <div className="flex flex-col gap-4">
                  {/* Score summary */}
                  <Card className={`border-2 ${
                    submissionResult.status === "passed"
                      ? "border-success/30 bg-success/5"
                      : submissionResult.status === "error"
                      ? "border-warning/30 bg-warning/5"
                      : "border-destructive/30 bg-destructive/5"
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {submissionResult.status === "passed" ? (
                            <CheckCircle2 className="h-8 w-8 text-success" />
                          ) : submissionResult.status === "error" ? (
                            <AlertCircle className="h-8 w-8 text-warning" />
                          ) : (
                            <XCircle className="h-8 w-8 text-destructive" />
                          )}
                          <div>
                            <p className="text-lg font-bold text-foreground">
                              {submissionResult.status === "passed"
                                ? "All Tests Passed!"
                                : submissionResult.status === "error"
                                ? "Runtime Error"
                                : "Some Tests Failed"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {submissionResult.passed_count} of {submissionResult.total_count} test cases passed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-foreground">{submissionResult.score}%</p>
                          <p className="text-xs text-muted-foreground">{submissionResult.execution_time_ms}ms</p>
                        </div>
                      </div>
                      <Progress
                        value={submissionResult.total_count > 0
                          ? (submissionResult.passed_count / submissionResult.total_count) * 100
                          : 0}
                        className="mt-3 h-2"
                      />
                    </CardContent>
                  </Card>

                  {/* Global stderr from submission */}
                  {submissionResult.stderr && (
                    <Card className="border-destructive/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <span className="text-sm font-medium text-destructive">Runtime Error</span>
                        </div>
                        <pre className="bg-destructive/10 p-3 rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap text-destructive">
                          {submissionResult.stderr}
                        </pre>
                      </CardContent>
                    </Card>
                  )}

                  {/* Individual test results */}
                  <div className="flex flex-col gap-2">
                    {submissionResult.test_results?.map((result) => (
                      <Card
                        key={result.id}
                        className={`border ${
                          result.passed ? "border-success/20" : "border-destructive/20"
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {result.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                              )}
                              <span className="text-sm font-medium">
                                Test Case {result.testcase?.order}
                              </span>
                              {result.testcase?.is_hidden && (
                                <Badge variant="secondary" className="text-xs">Hidden</Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {result.runtime_ms ?? "—"}ms
                            </span>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div>
                              <span className="text-muted-foreground">Input: </span>
                              <pre className="mt-0.5 bg-muted p-1.5 rounded font-mono overflow-x-auto whitespace-pre-wrap">{result.testcase?.input_data}</pre>
                            </div>
                            {!result.testcase?.is_hidden && result.expected_output && (
                              <div>
                                <span className="text-muted-foreground">Expected: </span>
                                <pre className="mt-0.5 bg-muted p-1.5 rounded font-mono overflow-x-auto whitespace-pre-wrap">{result.expected_output}</pre>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Output: </span>
                              <pre className={`mt-0.5 p-1.5 rounded font-mono overflow-x-auto whitespace-pre-wrap ${
                                result.passed ? "bg-success/10" : "bg-destructive/10"
                              }`}>{result.student_output || "(empty)"}</pre>
                            </div>
                            {result.stderr && (
                              <div>
                                <span className="text-destructive font-medium">Error: </span>
                                <pre className="mt-0.5 bg-destructive/10 p-1.5 rounded font-mono overflow-x-auto whitespace-pre-wrap text-destructive">{result.stderr}</pre>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onClick={() => setActiveRightTab("code")}
                  >
                    Back to Code
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
