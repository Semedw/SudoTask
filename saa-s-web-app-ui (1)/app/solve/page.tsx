"use client"

import { Suspense, useEffect, useState } from "react"
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
import { ThemeToggle } from "@/components/theme-toggle"
import { CodeEditor } from "@/components/code-editor"
import { getTask, getTestCases } from "@/lib/api/tasks"
import { submitCode, testCode, pollSubmission } from "@/lib/api/submissions"
import { Task, TestCase, Language, Submission, TestCodeResponse } from "@/lib/types"

const STARTER_CODE: Record<string, string> = {
  python: `# Read input and write your solution here\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Read input and write your solution here\n    return 0;\n}`,
  java: `import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input and write your solution here\n    }\n}`,
}

function SolveTaskPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = searchParams.get("taskId")
  
  const [task, setTask] = useState<Task | null>(null)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [language, setLanguage] = useState<Language>("python")
  const [code, setCode] = useState(STARTER_CODE.python)
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
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto opacity-30" />
          <p className="mt-4 text-lg font-bold text-muted-foreground">Preparing workspace...</p>
        </div>
      </div>
    )
  }

  const difficultyColors = {
    EASY: "bg-pastel-green text-green-900",
    MEDIUM: "bg-pastel-orange text-orange-900",
    HARD: "bg-pastel-pink text-pink-900",
  }

  return (
    <div className="flex h-screen flex-col bg-background p-4 gap-4 overflow-hidden">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between bg-white rounded-3xl px-6 py-3 shadow-sm border-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 hover:bg-secondary" asChild>
            <Link href="/student">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-pastel-blue rounded-2xl flex items-center justify-center">
               <Terminal className="h-5 w-5 text-blue-900" />
            </div>
            <div>
              <h1 className="text-lg font-black text-foreground leading-none">{task.title}</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase mt-1 tracking-wider">{task.classroom.name}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={(val) => handleLanguageChange(val as Language)}>
            <SelectTrigger className="w-[140px] rounded-full bg-secondary/50 border-0 font-bold h-10 shadow-sm px-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-0 shadow-xl">
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="java">Java</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="rounded-full px-6 font-bold h-10 bg-pastel-blue/20 text-blue-900 hover:bg-pastel-blue/30 transition-all shadow-sm"
              onClick={handleTest}
              disabled={isSubmitting || isPolling || isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  Run Test
                </>
              )}
            </Button>
            <Button
              className="rounded-full px-8 font-black h-10 shadow-md hover:scale-[1.02] transition-transform"
              onClick={handleSubmit}
              disabled={isSubmitting || isPolling || isTesting}
            >
              {isSubmitting || isPolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSubmitting ? "Submitting" : "Grading"}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Code
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row gap-4">
        {/* Left Panel - Task Description */}
        <div className="flex w-full flex-col lg:w-[400px] lg:shrink-0 bg-white rounded-[2.5rem] shadow-sm overflow-hidden border-0">
           <div className="flex items-center justify-between px-8 py-6 border-b border-secondary/50 bg-secondary/10">
              <h2 className="text-xl font-bold text-foreground">Task Details</h2>
              <Badge className={`rounded-full border-0 font-bold px-3 py-1 ${difficultyColors[task.difficulty]}`}>
                {task.difficulty}
              </Badge>
           </div>
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="flex flex-col gap-8">
              <div>
                <div className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground font-medium">
                  {task.description}
                </div>
              </div>

              {testCases.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-4">Example Cases</h2>
                  <div className="space-y-4">
                    {testCases.map((tc, index) => (
                      <div key={tc.id} className="bg-secondary/30 rounded-3xl p-5 border-0">
                        <p className="text-xs font-black text-muted-foreground uppercase mb-3 tracking-widest">Example #{index + 1}</p>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 px-1">Input</p>
                            <pre className="bg-white/80 p-3 rounded-2xl text-xs font-mono overflow-x-auto border-0 shadow-sm">{tc.input_data}</pre>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 px-1">Expected Output</p>
                            <pre className="bg-white/80 p-3 rounded-2xl text-xs font-mono overflow-x-auto border-0 shadow-sm">{tc.expected_output}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor + Results */}
        <div className="flex flex-1 flex-col overflow-hidden bg-white rounded-[2.5rem] shadow-sm border-0 relative">
          {/* Tabs for Code/Results */}
          <div className="flex items-center px-6 pt-4 border-b border-secondary/50 shrink-0">
             <button
                onClick={() => setActiveRightTab("code")}
                className={`px-8 py-4 text-sm font-bold transition-all relative ${
                  activeRightTab === "code"
                    ? "text-primary border-b-4 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Code Editor
              </button>
              <button
                onClick={() => setActiveRightTab("results")}
                className={`px-8 py-4 text-sm font-bold transition-all relative ${
                  activeRightTab === "results"
                    ? "text-primary border-b-4 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Output & Results
                {(submissionResult || testResult) && (
                   <span className="ml-2 bg-pastel-blue px-2 py-0.5 rounded-full text-[10px] text-blue-900 font-black">!</span>
                )}
              </button>
          </div>

          {/* Code Tab */}
          <div className={`flex-1 overflow-hidden p-6 ${activeRightTab === "code" ? "block" : "hidden"}`}>
             <div className="h-full rounded-3xl overflow-hidden border border-secondary/50 shadow-inner bg-secondary/5 p-2">
                <CodeEditor
                  value={code}
                  onChange={handleCodeChange}
                  language={language}
                  disabled={isSubmitting || isPolling}
                  placeholder="Write your solution here..."
                />
             </div>
          </div>

          {/* Results Tab */}
          <div className={`flex-1 overflow-y-auto p-8 custom-scrollbar ${activeRightTab === "results" ? "block" : "hidden"}`}>
              {!submissionResult && !testResult && !isPolling && !isTesting && (
                <div className="flex h-full flex-col items-center justify-center gap-4 py-20">
                  <div className="h-24 w-24 bg-pastel-blue/20 rounded-[2.5rem] flex items-center justify-center">
                    <FlaskConical className="h-12 w-12 text-blue-900 opacity-40" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">No results yet</p>
                    <p className="text-muted-foreground font-medium">Run a test or submit your code to see the magic happen.</p>
                  </div>
                </div>
              )}

              {(isPolling || isTesting) && !submissionResult && !testResult && (
                <div className="flex h-full flex-col items-center justify-center gap-6 py-20">
                  <div className="relative">
                    <Loader2 className="h-20 w-20 animate-spin text-primary opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Terminal className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground animate-pulse">
                      {isTesting ? "Executing your test code..." : "Evaluating your submission..."}
                    </p>
                    <p className="text-muted-foreground font-medium">Checking logic and test cases</p>
                  </div>
                </div>
              )}

              {/* --- TEST RESULTS --- */}
              {testResult && !submissionResult && (
                <div className="flex flex-col gap-6">
                  <div className={`p-8 rounded-[2rem] shadow-sm border-0 flex flex-col gap-6 ${
                    testResult.passed_tests === testResult.total_tests
                      ? "bg-pastel-green"
                      : "bg-pastel-orange"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-white/50 rounded-3xl flex items-center justify-center shadow-sm">
                          {testResult.passed_tests === testResult.total_tests ? (
                            <CheckCircle2 className="h-8 w-8 text-green-900" />
                          ) : (
                            <AlertCircle className="h-8 w-8 text-orange-900" />
                          )}
                        </div>
                        <div>
                          <p className="text-2xl font-black text-current leading-tight">
                            {testResult.passed_tests === testResult.total_tests
                              ? "Excellent! Ready to submit?"
                              : "Not quite there yet"}
                          </p>
                          <p className="text-sm font-bold opacity-70">
                            {testResult.passed_tests} of {testResult.total_tests} visible tests passed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-5xl font-black">{Math.round((testResult.passed_tests / testResult.total_tests) * 100)}%</p>
                         <p className="text-xs font-bold uppercase tracking-wider opacity-60">Visible Test Score</p>
                      </div>
                    </div>
                    <Progress
                      value={testResult.total_tests > 0 ? (testResult.passed_tests / testResult.total_tests) * 100 : 0}
                      className="h-4 bg-white/30 rounded-full"
                    />
                  </div>

                  <div className="grid gap-4">
                    {testResult.results?.map((result, i) => (
                      <div
                        key={result.testcase?.id ?? i}
                        className={`bg-white rounded-3xl p-6 shadow-sm border-l-8 border-0`}
                        style={{ borderLeftColor: result.passed ? 'var(--pastel-green-dark, #86efac)' : 'var(--pastel-pink-dark, #f9a8d4)' }}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${result.passed ? "bg-pastel-green" : "bg-pastel-pink"}`}>
                              {result.passed ? <CheckCircle2 className="h-5 w-5 text-green-900" /> : <XCircle className="h-5 w-5 text-pink-900" />}
                            </div>
                            <span className="text-lg font-bold">Case {result.testcase?.order}</span>
                          </div>
                          <Badge variant="secondary" className="rounded-full bg-secondary/50 font-bold">{result.runtime_ms ?? "—"}ms</Badge>
                        </div>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                             <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 px-1">Input</p>
                                <pre className="bg-secondary/30 p-3 rounded-2xl text-xs font-mono overflow-x-auto">{result.testcase?.input_data}</pre>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 px-1">Expected</p>
                                <pre className="bg-secondary/30 p-3 rounded-2xl text-xs font-mono overflow-x-auto">{result.expected_output}</pre>
                             </div>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 px-1">Actual Output</p>
                             <pre className={`p-4 rounded-2xl text-xs font-mono overflow-x-auto border-0 ${
                               result.passed ? "bg-pastel-green/20" : "bg-pastel-pink/20 text-pink-900"
                             }`}>{result.student_output || "(empty)"}</pre>
                          </div>
                          {result.stderr && (
                            <div className="mt-2 bg-destructive/5 p-4 rounded-2xl border border-destructive/10">
                              <p className="text-[10px] font-black text-destructive uppercase mb-2">Error Log</p>
                              <pre className="text-xs font-mono overflow-x-auto text-destructive whitespace-pre-wrap">{result.stderr}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- SUBMISSION RESULTS --- */}
              {submissionResult && (
                <div className="flex flex-col gap-8">
                  <div className={`p-10 rounded-[2.5rem] shadow-sm flex flex-col gap-8 ${
                    submissionResult.status === "passed"
                      ? "bg-pastel-green"
                      : submissionResult.status === "error"
                      ? "bg-pastel-blue"
                      : "bg-pastel-pink"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="h-20 w-20 bg-white/50 rounded-[2rem] flex items-center justify-center shadow-sm">
                          {submissionResult.status === "passed" ? (
                            <CheckCircle2 className="h-10 w-10 text-green-900" />
                          ) : submissionResult.status === "error" ? (
                            <AlertCircle className="h-10 w-10 text-blue-900" />
                          ) : (
                            <XCircle className="h-10 w-10 text-pink-900" />
                          )}
                        </div>
                        <div>
                          <p className="text-3xl font-black text-current leading-tight">
                            {submissionResult.status === "passed"
                              ? "Submission Passed!"
                              : submissionResult.status === "error"
                              ? "System Error Occurred"
                              : "Review your logic"}
                          </p>
                          <p className="text-lg font-bold opacity-70">
                            {submissionResult.passed_count} of {submissionResult.total_count} test cases passed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-7xl font-black">{submissionResult.score}%</p>
                        <p className="text-sm font-bold uppercase tracking-wider opacity-60">Final Grade</p>
                      </div>
                    </div>
                    <Progress
                      value={submissionResult.total_count > 0 ? (submissionResult.passed_count / submissionResult.total_count) * 100 : 0}
                      className="h-5 bg-white/30 rounded-full"
                    />
                  </div>

                  {/* Individual submission test results */}
                  <div className="grid gap-4">
                    {submissionResult.test_results?.map((result) => (
                      <div
                        key={result.id}
                        className="bg-white rounded-3xl p-6 shadow-sm border-l-8 border-0"
                        style={{ borderLeftColor: result.passed ? 'var(--pastel-green-dark, #86efac)' : 'var(--pastel-pink-dark, #f9a8d4)' }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${result.passed ? "bg-pastel-green" : "bg-pastel-pink"}`}>
                              {result.passed ? <CheckCircle2 className="h-5 w-5 text-green-900" /> : <XCircle className="h-5 w-5 text-pink-900" />}
                            </div>
                            <span className="text-lg font-bold">Case {result.testcase?.order}</span>
                            {result.testcase?.is_hidden && (
                              <Badge className="bg-secondary text-secondary-foreground border-0 text-[10px] font-bold h-5 uppercase">Hidden</Badge>
                            )}
                          </div>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{result.runtime_ms ?? "—"}ms</span>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 px-1 tracking-widest">Input</p>
                              <pre className="bg-secondary/30 p-3 rounded-2xl text-xs font-mono overflow-x-auto whitespace-pre-wrap">{result.testcase?.input_data}</pre>
                            </div>
                            {!result.testcase?.is_hidden && result.expected_output && (
                              <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 px-1 tracking-widest">Expected</p>
                                <pre className="bg-secondary/30 p-3 rounded-2xl text-xs font-mono overflow-x-auto whitespace-pre-wrap">{result.expected_output}</pre>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 px-1 tracking-widest">Actual Output</p>
                            <pre className={`p-4 rounded-2xl text-xs font-mono overflow-x-auto border-0 ${
                              result.passed ? "bg-pastel-green/20" : "bg-pastel-pink/20 text-pink-900"
                            }`}>{result.student_output || "(empty)"}</pre>
                          </div>
                          {result.stderr && (
                            <div className="mt-2 bg-destructive/5 p-4 rounded-2xl border border-destructive/10">
                              <p className="text-[10px] font-black text-destructive uppercase mb-2">Error Stream</p>
                              <pre className="text-xs font-mono overflow-x-auto text-destructive whitespace-pre-wrap">{result.stderr}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SolveTaskPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto opacity-30" />
            <p className="mt-4 text-lg font-bold text-muted-foreground">Initializing...</p>
          </div>
        </div>
      }
    >
      <SolveTaskPageContent />
    </Suspense>
  )
}
