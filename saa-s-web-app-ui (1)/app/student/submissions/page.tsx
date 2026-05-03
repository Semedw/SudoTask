"use client"

import { Suspense, useEffect, useState } from "react"
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

function SubmissionResultPageContent() {
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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto opacity-50" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">Fetching your result...</p>
        </div>
      </div>
    )
  }

  const isPending = submission.status === "pending" || submission.status === "running"
  const passPercentage = submission.total_count > 0
    ? (submission.passed_count / submission.total_count) * 100
    : 0

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Header section */}
      <div className="flex flex-col gap-6 pt-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm" asChild>
            <Link href="/student">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Submission Result
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xl text-muted-foreground font-medium">{submission.task.title}</p>
          <Badge 
            className={`px-4 py-1.5 rounded-full font-bold border-0 text-sm shadow-sm ${
              submission.status === "passed" ? "bg-pastel-green text-green-900" : 
              submission.status === "failed" ? "bg-pastel-pink text-pink-900" : 
              "bg-pastel-blue text-blue-900"
            }`}
          >
            {isPolling ? "Processing..." : submission.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Score Card */}
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 shadow-sm h-fit">
          <h2 className="text-2xl font-bold text-foreground mb-6">Overall Score</h2>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-6xl font-black text-foreground">{submission.score}%</span>
              <div className={`h-16 w-16 rounded-3xl flex items-center justify-center ${submission.status === 'passed' ? 'bg-pastel-green' : 'bg-pastel-pink'}`}>
                {submission.status === 'passed' ? <CheckCircle2 className="h-8 w-8 text-green-900" /> : <XCircle className="h-8 w-8 text-pink-900" />}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-muted-foreground">
                <span>{submission.passed_count} / {submission.total_count} tests passed</span>
                <span>{Math.round(passPercentage)}%</span>
              </div>
              <Progress value={passPercentage} className="h-4 bg-secondary rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 mt-2 border-t border-secondary/50">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Language</p>
                <p className="text-lg font-bold text-foreground">{submission.language.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Runtime</p>
                <p className="text-lg font-bold text-foreground">{submission.execution_time_ms}ms</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 pt-6">
              <Button className="w-full rounded-full py-6 font-bold shadow-md hover:scale-[1.02] transition-transform" asChild>
                <Link href={`/solve?taskId=${submission.task.id}`}>Try Again</Link>
              </Button>
              <Button variant="ghost" className="w-full rounded-full py-6 font-bold bg-secondary/50" asChild>
                <Link href="/student">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-foreground px-2">Test Cases</h2>
          
          {submission.test_results?.length === 0 && isPending && (
            <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary opacity-30" />
              <p className="text-xl font-bold text-muted-foreground">Running test cases...</p>
            </div>
          )}
          
          <div className="grid gap-4">
            {submission.test_results?.map((result, idx) => (
              <div key={result.id} className="bg-white rounded-[2rem] p-6 shadow-sm border-l-8 overflow-hidden transition-all hover:translate-x-1" style={{ borderLeftColor: result.passed ? 'var(--pastel-green-dark, #86efac)' : 'var(--pastel-pink-dark, #f9a8d4)' }}>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${result.passed ? "bg-pastel-green" : "bg-pastel-pink"}`}>
                      {result.passed ? <CheckCircle2 className="h-5 w-5 text-green-900" /> : <XCircle className="h-5 w-5 text-pink-900" />}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground">Test Case {result.testcase?.order}</h4>
                      {result.testcase?.is_hidden && (
                        <Badge className="bg-secondary text-secondary-foreground border-0 text-[10px] font-bold h-5 uppercase">Hidden</Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="rounded-full bg-secondary/50 border-0 font-bold px-3">{result.testcase?.weight_points} pts</Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Input</p>
                      <pre className="bg-secondary/30 p-4 rounded-2xl text-xs font-mono overflow-x-auto border-0">
                        {result.testcase?.input_data}
                      </pre>
                    </div>
                    
                    {!result.testcase?.is_hidden && result.expected_output && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Expected Output</p>
                        <pre className="bg-secondary/30 p-4 rounded-2xl text-xs font-mono overflow-x-auto border-0">
                          {result.expected_output}
                        </pre>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Your Output</p>
                    <pre className={`p-4 rounded-2xl text-xs font-mono overflow-x-auto border-0 ${
                      result.passed ? "bg-pastel-green/20" : "bg-pastel-pink/20 text-pink-900"
                    }`}>
                      {result.student_output}
                    </pre>
                  </div>
                  
                  {result.stderr && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-destructive uppercase tracking-wider px-1">Error Stream</p>
                      <pre className="bg-destructive/5 p-4 rounded-2xl text-xs font-mono overflow-x-auto text-destructive border border-destructive/10">
                        {result.stderr}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Console Output */}
          {(submission.stdout || submission.stderr) && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm mt-4">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Terminal className="h-5 w-5 opacity-50" />
                Console Output
              </h3>
              <div className="space-y-6">
                {submission.stdout && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Standard Output</p>
                    <pre className="bg-secondary/30 p-5 rounded-[1.5rem] text-xs font-mono overflow-x-auto">
                      {submission.stdout}
                    </pre>
                  </div>
                )}
                {submission.stderr && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-destructive uppercase tracking-wider px-1">Standard Error</p>
                    <pre className="bg-destructive/5 p-5 rounded-[1.5rem] text-xs font-mono overflow-x-auto text-destructive">
                      {submission.stderr}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SubmissionResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-sm text-muted-foreground">Loading submission...</p>
          </div>
        </div>
      }
    >
      <SubmissionResultPageContent />
    </Suspense>
  )
}
