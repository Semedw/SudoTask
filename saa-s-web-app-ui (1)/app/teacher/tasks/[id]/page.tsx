"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  FileCode,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { getTask, getTestCases, deleteTask, addTestCase, deleteTestCase } from "@/lib/api/tasks"
import { getSubmissions } from "@/lib/api/submissions"
import { Task, TestCase, Submission } from "@/lib/types"

const difficultyColors: Record<string, string> = {
  EASY: "bg-success/10 text-success border-success/20",
  MEDIUM: "bg-warning/10 text-warning border-warning/20",
  HARD: "bg-destructive/10 text-destructive border-destructive/20",
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = Number(params.id)

  const [task, setTask] = useState<Task | null>(null)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  // Add test case dialog state
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isAddingTestCase, setIsAddingTestCase] = useState(false)
  const [newTestCase, setNewTestCase] = useState({
    input_data: "",
    expected_output: "",
    is_hidden: false,
    weight_points: 20,
  })

  // View submission dialog
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  useEffect(() => {
    if (!taskId || isNaN(taskId)) {
      toast.error("Invalid task ID")
      router.push("/teacher/tasks")
      return
    }

    async function fetchData() {
      try {
        setIsLoading(true)
        const [taskData, testCasesData, submissionsData] = await Promise.all([
          getTask(taskId),
          getTestCases(taskId),
          getSubmissions(taskId),
        ])
        setTask(taskData)
        setTestCases(testCasesData)
        setSubmissions(submissionsData)
      } catch (error: any) {
        toast.error(error.message || "Failed to load task")
        router.push("/teacher/tasks")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [taskId, router])

  const handleDelete = async () => {
    if (!task) return
    try {
      setIsDeleting(true)
      await deleteTask(task.id)
      toast.success("Task deleted successfully")
      router.push("/teacher/tasks")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete task")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddTestCase = async () => {
    if (!newTestCase.input_data.trim()) {
      toast.error("Input data is required")
      return
    }
    try {
      setIsAddingTestCase(true)
      const created = await addTestCase(taskId, {
        input_data: newTestCase.input_data,
        expected_output: newTestCase.expected_output,
        is_hidden: newTestCase.is_hidden,
        weight_points: newTestCase.weight_points,
        order: testCases.length + 1,
      })
      setTestCases((prev) => [...prev, created])
      setNewTestCase({ input_data: "", expected_output: "", is_hidden: false, weight_points: 20 })
      setShowAddDialog(false)
      toast.success("Test case added")
    } catch (error: any) {
      toast.error(error.message || "Failed to add test case")
    } finally {
      setIsAddingTestCase(false)
    }
  }

  const handleDeleteTestCase = async (tcId: number) => {
    try {
      await deleteTestCase(tcId)
      setTestCases((prev) => prev.filter((tc) => tc.id !== tcId))
      toast.success("Test case deleted")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete test case")
    }
  }

  if (isLoading || !task) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading task...</p>
        </div>
      </div>
    )
  }

  const passedSubmissions = submissions.filter((s) => s.status === "passed")
  const failedSubmissions = submissions.filter((s) => s.status === "failed")
  const avgScore =
    submissions.length > 0
      ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length)
      : 0
  const publicTestCases = testCases.filter((tc) => !tc.is_hidden)
  const hiddenTestCases = testCases.filter((tc) => tc.is_hidden)
  const totalPoints = testCases.reduce((sum, tc) => sum + tc.weight_points, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/teacher/tasks">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {task.title}
              </h1>
              <Badge variant="outline" className={difficultyColors[task.difficulty]}>
                {task.difficulty}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {task.classroom?.name}
              {task.deadline && (
                <span className="ml-2">
                  · Due {new Date(task.deadline).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{task.title}&quot;? This will also
                  delete all associated test cases and submissions. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{submissions.length}</p>
                <p className="text-xs text-muted-foreground">Total Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{passedSubmissions.length}</p>
                <p className="text-xs text-muted-foreground">Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{failedSubmissions.length}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column — Description & Tags */}
        <div className="flex flex-col gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {task.description}
              </p>
              {task.tags && task.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Cases */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Test Cases</CardTitle>
                  <CardDescription>
                    {testCases.length} test cases · {totalPoints} total points
                  </CardDescription>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Add Test Case
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add Test Case</DialogTitle>
                      <DialogDescription>
                        Define the input and expected output for this test case.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="tc-input">Input</Label>
                        <Textarea
                          id="tc-input"
                          placeholder="e.g. 5"
                          value={newTestCase.input_data}
                          onChange={(e) =>
                            setNewTestCase((prev) => ({ ...prev, input_data: e.target.value }))
                          }
                          rows={3}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="tc-output">Expected Output</Label>
                        <Textarea
                          id="tc-output"
                          placeholder="e.g. 120"
                          value={newTestCase.expected_output}
                          onChange={(e) =>
                            setNewTestCase((prev) => ({ ...prev, expected_output: e.target.value }))
                          }
                          rows={3}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="tc-points">Points</Label>
                          <Input
                            id="tc-points"
                            type="number"
                            min={0}
                            value={newTestCase.weight_points}
                            onChange={(e) =>
                              setNewTestCase((prev) => ({
                                ...prev,
                                weight_points: parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label>Visibility</Label>
                          <div className="flex items-center gap-2 pt-2">
                            <Switch
                              checked={newTestCase.is_hidden}
                              onCheckedChange={(checked) =>
                                setNewTestCase((prev) => ({ ...prev, is_hidden: checked }))
                              }
                            />
                            <span className="text-sm text-muted-foreground">
                              {newTestCase.is_hidden ? "Hidden" : "Public"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                        disabled={isAddingTestCase}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddTestCase}
                        disabled={isAddingTestCase}
                        className="gap-1.5"
                      >
                        {isAddingTestCase ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Test Case"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {testCases.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No test cases defined yet.
                </p>
              )}
              {testCases.map((tc, index) => (
                <Card key={tc.id} className="border-border bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          Test Case #{tc.order ?? index + 1}
                        </span>
                        <Badge variant="secondary" className="text-xs gap-1">
                          {tc.is_hidden ? (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Hidden
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3" />
                              Public
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {tc.weight_points} pts
                        </span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Test Case</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete Test Case #{tc.order ?? index + 1}?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTestCase(tc.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-1">Input:</p>
                        <pre className="bg-muted p-2 rounded overflow-x-auto font-mono">
                          {tc.input_data}
                        </pre>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Expected Output:</p>
                        <pre className="bg-muted p-2 rounded overflow-x-auto font-mono">
                          {tc.expected_output ?? "—"}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Submissions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Submissions</CardTitle>
            <CardDescription>
              {submissions.length} submissions ·{" "}
              {submissions.length > 0
                ? `${Math.round(
                    (passedSubmissions.length / submissions.length) * 100
                  )}% pass rate`
                : "No submissions yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No submissions yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Tests</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {sub.student?.first_name} {sub.student?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sub.created_at).toLocaleString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={sub.status === "passed" ? "default" : "destructive"}
                          className={
                            sub.status === "passed"
                              ? "bg-success/10 text-success border-success/20"
                              : ""
                          }
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {sub.score}%
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {sub.passed_count}/{sub.total_count}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {sub.execution_time_ms ?? "—"}ms
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => setSelectedSubmission(sub)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Submission Dialog */}
      <Dialog
        open={!!selectedSubmission}
        onOpenChange={(open) => { if (!open) setSelectedSubmission(null) }}
      >
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] flex flex-col">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-primary" />
                  Submission by {selectedSubmission.student?.first_name}{" "}
                  {selectedSubmission.student?.last_name}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <Badge
                    variant={selectedSubmission.status === "passed" ? "default" : "destructive"}
                    className={
                      selectedSubmission.status === "passed"
                        ? "bg-success/10 text-success border-success/20"
                        : ""
                    }
                  >
                    {selectedSubmission.status}
                  </Badge>
                  <span>Score: {selectedSubmission.score}%</span>
                  <span>
                    {selectedSubmission.passed_count}/{selectedSubmission.total_count} tests
                  </span>
                  <span>{selectedSubmission.language?.toUpperCase()}</span>
                  <span>
                    {new Date(selectedSubmission.created_at).toLocaleString()}
                  </span>
                </div>
              </DialogHeader>

              <Tabs defaultValue="code" className="flex-1 overflow-hidden flex flex-col">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="results">
                    Test Results ({selectedSubmission.passed_count}/{selectedSubmission.total_count})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="code" className="flex-1 overflow-hidden mt-2">
                  <ScrollArea className="h-[400px] w-full rounded-md border border-border">
                    <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
                      {selectedSubmission.code}
                    </pre>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="results" className="flex-1 overflow-hidden mt-2">
                  <ScrollArea className="h-[400px] w-full">
                    <div className="flex flex-col gap-3 pr-4">
                      {selectedSubmission.test_results?.length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          No test results available.
                        </p>
                      )}
                      {selectedSubmission.test_results?.map((result) => (
                        <Card
                          key={result.id}
                          className={`border-2 ${
                            result.passed
                              ? "border-success/20"
                              : "border-destructive/20"
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
                                  {result.testcase?.is_hidden && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      Hidden
                                    </Badge>
                                  )}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {result.runtime_ms ?? "—"}ms
                              </span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div>
                                <p className="text-muted-foreground mb-1">Input:</p>
                                <pre className="bg-muted p-2 rounded overflow-x-auto font-mono">
                                  {result.testcase?.input_data}
                                </pre>
                              </div>
                              {result.expected_output && (
                                <div>
                                  <p className="text-muted-foreground mb-1">Expected:</p>
                                  <pre className="bg-muted p-2 rounded overflow-x-auto font-mono">
                                    {result.expected_output}
                                  </pre>
                                </div>
                              )}
                              <div>
                                <p className="text-muted-foreground mb-1">Student Output:</p>
                                <pre
                                  className={`p-2 rounded overflow-x-auto font-mono ${
                                    result.passed ? "bg-success/10" : "bg-destructive/10"
                                  }`}
                                >
                                  {result.student_output || "(empty)"}
                                </pre>
                              </div>
                              {result.stderr && (
                                <div>
                                  <p className="text-destructive mb-1">Error:</p>
                                  <pre className="bg-destructive/10 p-2 rounded overflow-x-auto font-mono text-destructive">
                                    {result.stderr}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
