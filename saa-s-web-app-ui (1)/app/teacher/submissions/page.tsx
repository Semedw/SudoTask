"use client"

import { useState } from "react"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { recentSubmissions, solveTaskData } from "@/lib/mock-data"

interface Submission {
  id: string
  studentName: string
  taskName: string
  className: string
  status: "passed" | "failed"
  score: number
  language: string
  submittedAt: string
}

export default function SubmissionsPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Submissions</h1>
        <p className="text-sm text-muted-foreground">Review all student submissions and results</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSubmissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium text-foreground">{sub.studentName}</TableCell>
                  <TableCell className="text-muted-foreground">{sub.taskName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={sub.status === "passed" ? "default" : "destructive"}
                      className={sub.status === "passed" ? "bg-success text-success-foreground" : ""}
                    >
                      {sub.status === "passed" ? "Passed" : "Failed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium text-foreground">{sub.score}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{sub.language}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{sub.submittedAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
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
        </CardContent>
      </Card>

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Submission Details</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.studentName} - {selectedSubmission?.taskName}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={selectedSubmission?.status === "passed" ? "default" : "destructive"}
              className={selectedSubmission?.status === "passed" ? "bg-success text-success-foreground" : ""}
            >
              {selectedSubmission?.status === "passed" ? "Passed" : "Failed"}
            </Badge>
            <Badge variant="secondary">Score: {selectedSubmission?.score}</Badge>
            <Badge variant="outline">{selectedSubmission?.language}</Badge>
          </div>

          <Tabs defaultValue="code" className="mt-2">
            <TabsList>
              <TabsTrigger value="code">Student Code</TabsTrigger>
              <TabsTrigger value="tests">Test Results</TabsTrigger>
              <TabsTrigger value="diff">Diff View</TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="mt-4">
              <div className="rounded-lg border border-border bg-foreground/[0.03] p-4">
                <pre className="overflow-x-auto text-sm leading-relaxed text-foreground">
                  <code className="font-mono">{solveTaskData.starterCode}</code>
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="tests" className="mt-4">
              <div className="flex flex-col gap-3">
                {solveTaskData.testCases.map((tc, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-3 ${
                      tc.passed ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Test Case #{i + 1}</span>
                      <Badge
                        variant={tc.passed ? "default" : "destructive"}
                        className={tc.passed ? "bg-success text-success-foreground" : ""}
                      >
                        {tc.passed ? "Passed" : "Failed"} ({tc.points}pts)
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Input</p>
                        <p className="mt-0.5 font-mono text-foreground">{tc.input}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected Output</p>
                        <p className="mt-0.5 font-mono text-foreground">{tc.expectedOutput}</p>
                      </div>
                    </div>
                    {!tc.passed && tc.studentOutput && (
                      <div className="mt-2 text-xs">
                        <p className="text-destructive">Student Output</p>
                        <p className="mt-0.5 font-mono text-foreground">{tc.studentOutput}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="diff" className="mt-4">
              <div className="flex flex-col gap-3">
                {solveTaskData.testCases
                  .filter((tc) => !tc.passed)
                  .map((tc, i) => (
                    <div key={i} className="rounded-lg border border-border p-3">
                      <p className="text-sm font-medium text-foreground">Failed Test Case #{i + 1}</p>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div className="rounded-md border border-success/30 bg-success/5 p-3">
                          <p className="mb-1 text-xs font-medium text-success">Expected</p>
                          <p className="font-mono text-sm text-foreground">{tc.expectedOutput}</p>
                        </div>
                        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                          <p className="mb-1 text-xs font-medium text-destructive">Actual</p>
                          <p className="font-mono text-sm text-foreground">{tc.studentOutput}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
