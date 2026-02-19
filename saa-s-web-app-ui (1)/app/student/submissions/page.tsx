"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, XCircle, Clock, Terminal, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { pollSubmission } from "@/lib/api/submissions"
import { Submission } from "@/lib/types"
import { toast } from "sonner"

export default function SubmissionResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const submissionId = searchParams.get("id")
  
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isPolling, setIsPolling] = useState(true)

  useEffect(() => {
    if (!submissionId) {
      toast.error("No submission ID provided")
      router.push("/student")
      return
    }

    const id = parseInt(submissionId)
    if (isNaN(id)) {
      toast.error("Invalid submission ID")
      router.push("/student")
      return
    }

    // Start polling
    pollSubmission(id, 150, 1500)
      .then((finalSubmission) => {
        setSubmission(finalSubmission)
        setIsPolling(false)
        
        if (finalSubmission.status === "passed") {
          toast.success(`Submission passed! Score: ${finalSubmission.score}`)
        } else if (finalSubmission.status === "failed") {
          toast.error(`Submission failed. Score: ${finalSubmission.score}`)
        } else if (finalSubmission.status === "error") {
          toast.error("Submission error occurred")
        }
      })
      .catch((error) => {
        const errorMessage = error?.message || (typeof error === "string" ? error : "Failed to fetch submission")
        toast.error(errorMessage)
        setIsPolling(false)
      })
  }, [submissionId, router])

  if (!submission) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading submission...</p>
        </div>
      </div>
    )
  }

  const isPending = submission.status === "pending" || submission.status === "running"
  const passPercentage = submission.total_count > 0
    ? (submission.passed_count / submission.total_count) * 100
    : 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/student">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Submission Result</h1>
                <p className="text-sm text-muted-foreground">{submission.task.title}</p>
              </div>
            </div>
            <Badge 
              variant={
                submission.status === "passed" ? "default" : 
                submission.status === "failed" ? "destructive" : 
                "secondary"
              }
              className={submission.status === "passed" ? "bg-success text-success-foreground" : ""}
            >
              {isPolling ? "Processing..." : submission.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Score</span>
                {isPending && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold text-foreground">{submission.score}%</span>
                <span className="text-lg text-muted-foreground">
                  {submission.passed_count} / {submission.total_count} tests passed
                </span>
              </div>
              <Progress value={passPercentage} className="h-3" />
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-medium">{submission.language.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Execution Time</p>
                  <p className="font-medium">{submission.execution_time_ms}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {submission.test_results?.length === 0 && isPending && (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Running test cases...</p>
                </div>
              )}
              
              {submission.test_results?.map((result) => (
                <Card key={result.id} className={`border-2 ${
                  result.passed ? "border-success/20" : "border-destructive/20"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {result.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              Test Case {result.testcase?.order}
                              {result.testcase?.is_hidden && (
                                <Badge variant="secondary" className="ml-2 text-xs">Hidden</Badge>
                              )}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                              {result.testcase?.weight_points} points
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">Input:</p>
                              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                                {result.testcase?.input_data}
                              </pre>
                            </div>
                            
                            {!result.testcase?.is_hidden && result.expected_output && (
                              <div>
                                <p className="text-muted-foreground mb-1">Expected Output:</p>
                                <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                                  {result.expected_output}
                                </pre>
                              </div>
                            )}
                            
                            <div>
                              <p className="text-muted-foreground mb-1">Your Output:</p>
                              <pre className={`p-2 rounded text-xs overflow-x-auto ${
                                result.passed ? "bg-success/10" : "bg-destructive/10"
                              }`}>
                                {result.student_output}
                              </pre>
                            </div>
                            
                            {result.stderr && (
                              <div>
                                <p className="text-destructive mb-1">Error:</p>
                                <pre className="bg-destructive/10 p-2 rounded text-xs overflow-x-auto text-destructive">
                                  {result.stderr}
                                </pre>
                              </div>
                            )}
                            
                            <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                              <span>Time: {result.runtime_ms ?? "-"}ms</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Stdout/Stderr */}
          {(submission.stdout || submission.stderr) && (
            <Card>
              <CardHeader>
                <CardTitle>Console Output</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {submission.stdout && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Standard Output:</p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      {submission.stdout}
                    </pre>
                  </div>
                )}
                {submission.stderr && (
                  <div>
                    <p className="text-sm text-destructive mb-2">Standard Error:</p>
                    <pre className="bg-destructive/10 p-3 rounded text-xs overflow-x-auto text-destructive">
                      {submission.stderr}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/student">Back to Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href={`/solve?taskId=${submission.task.id}`}>Try Again</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
