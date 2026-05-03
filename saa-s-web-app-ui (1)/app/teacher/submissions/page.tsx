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
  id: string | number
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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Submissions</h1>
        <p className="text-lg font-medium text-muted-foreground">Review all student submissions and results</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-0">
        <div className="mb-6 px-2">
          <h2 className="text-2xl font-bold text-foreground">All Submissions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest px-4">Student</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest px-4">Task</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest px-4">Status</TableHead>
                <TableHead className="text-center font-bold text-muted-foreground uppercase text-[10px] tracking-widest px-4">Score</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest px-4">Language</TableHead>
                <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest px-4">Submitted</TableHead>
                <TableHead className="text-right font-bold text-muted-foreground uppercase text-[10px] tracking-widest px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSubmissions.map((sub) => (
                <TableRow key={sub.id} className="border-0 hover:bg-secondary/20 rounded-2xl transition-colors">
                  <TableCell className="font-bold text-foreground py-5 px-4">{sub.studentName}</TableCell>
                  <TableCell className="text-muted-foreground font-medium py-5 px-4">{sub.taskName}</TableCell>
                  <TableCell className="py-5 px-4">
                    <Badge
                      className={`rounded-full font-bold px-3 py-1 border-0 ${
                        sub.status === "passed" 
                          ? "bg-pastel-green text-green-900" 
                          : "bg-pastel-pink text-pink-900"
                      }`}
                    >
                      {sub.status === "passed" ? "Passed" : "Failed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center py-5 px-4">
                     <span className={`inline-flex items-center justify-center h-10 w-10 rounded-2xl font-bold text-sm shadow-sm ${
                        sub.score >= 80 ? 'bg-pastel-green text-green-900' : sub.score >= 60 ? 'bg-pastel-orange text-orange-900' : 'bg-pastel-pink text-pink-900'
                     }`}>
                        {sub.score}
                      </span>
                  </TableCell>
                  <TableCell className="py-5 px-4">
                    <Badge className="bg-pastel-blue text-blue-900 border-0 font-bold px-3">{sub.language}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium py-5 px-4">{sub.submittedAt}</TableCell>
                  <TableCell className="text-right py-5 px-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-full font-bold bg-secondary/50"
                      onClick={() => setSelectedSubmission(sub)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-4xl rounded-[2.5rem] border-0 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-pastel-blue p-8">
             <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-black text-blue-900">Submission Review</DialogTitle>
                  <DialogDescription className="text-blue-900/60 font-bold text-lg">
                    {selectedSubmission?.studentName} <span className="opacity-40">on</span> {selectedSubmission?.taskName}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                   <Badge className={`rounded-full font-bold px-4 py-2 border-0 text-sm ${
                        selectedSubmission?.status === "passed" 
                          ? "bg-white text-green-900" 
                          : "bg-white text-pink-900"
                      }`}>
                      {selectedSubmission?.status === "passed" ? "Passed" : "Failed"}
                   </Badge>
                   <Badge className="bg-white text-blue-900 border-0 font-bold px-4 py-2 text-sm rounded-full">Score: {selectedSubmission?.score}</Badge>
                </div>
             </div>
          </DialogHeader>

          <div className="p-8">
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="bg-secondary/50 p-1 rounded-full h-auto mb-8">
                <TabsTrigger value="code" className="rounded-full py-3 px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Student Code</TabsTrigger>
                <TabsTrigger value="tests" className="rounded-full py-3 px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Test Results</TabsTrigger>
                <TabsTrigger value="diff" className="rounded-full py-3 px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Diff Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="code" className="mt-0 ring-0 outline-none">
                <div className="rounded-3xl bg-secondary/20 p-8 border-2 border-secondary/50">
                  <pre className="overflow-x-auto text-sm leading-relaxed text-foreground font-bold">
                    <code className="font-mono">{solveTaskData.starterCode}</code>
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="tests" className="mt-0 ring-0 outline-none">
                <div className="grid gap-4">
                  {solveTaskData.testCases.map((tc, i) => (
                    <div
                      key={i}
                      className={`rounded-3xl p-6 transition-all ${
                        tc.passed ? "bg-pastel-green/30" : "bg-pastel-pink/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-black text-foreground">Test Case #{i + 1}</span>
                        <Badge className={`rounded-full font-bold px-3 py-1 ${tc.passed ? "bg-white text-green-900" : "bg-white text-pink-900"}`}>
                          {tc.passed ? "Passed" : "Failed"} (+{tc.points}pts)
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/50 rounded-2xl p-4">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Input</p>
                          <p className="font-mono text-sm font-bold">{tc.input}</p>
                        </div>
                        <div className="bg-white/50 rounded-2xl p-4">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Expected Output</p>
                          <p className="font-mono text-sm font-bold">{tc.expectedOutput}</p>
                        </div>
                      </div>
                      {!tc.passed && tc.studentOutput && (
                        <div className="mt-4 bg-white/50 rounded-2xl p-4 border-2 border-pink-200">
                          <p className="text-[10px] font-black text-pink-900 uppercase tracking-widest mb-1">Student Output</p>
                          <p className="font-mono text-sm font-bold text-pink-900">{tc.studentOutput}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="diff" className="mt-0 ring-0 outline-none">
                <div className="flex flex-col gap-6">
                  {solveTaskData.testCases
                    .filter((tc) => !tc.passed)
                    .map((tc, i) => (
                      <div key={i} className="bg-white rounded-3xl p-8 border-2 border-secondary/50 shadow-sm">
                        <p className="text-xl font-black text-foreground mb-6">Failed Test Case Analysis</p>
                        <div className="grid grid-cols-2 gap-8">
                          <div className="bg-pastel-green/20 rounded-2xl p-6">
                            <p className="text-[10px] font-black text-green-900 uppercase tracking-widest mb-2">Expected Correct Result</p>
                            <p className="font-mono text-lg font-black text-green-900">{tc.expectedOutput}</p>
                          </div>
                          <div className="bg-pastel-pink/20 rounded-2xl p-6">
                            <p className="text-[10px] font-black text-pink-900 uppercase tracking-widest mb-2">Actual Student Result</p>
                            <p className="font-mono text-lg font-black text-pink-900">{tc.studentOutput}</p>
                          </div>
                        </div>
                        <div className="mt-6 p-4 bg-secondary/30 rounded-2xl">
                           <p className="text-sm font-bold text-muted-foreground italic">Suggestion: Check the logic in the main loop, it seems to be returning the result prematurely.</p>
                        </div>
                      </div>
                    ))}
                  {solveTaskData.testCases.filter(tc => !tc.passed).length === 0 && (
                     <div className="text-center py-20 bg-pastel-green/20 rounded-[2.5rem]">
                        <p className="text-2xl font-black text-green-900">All tests passed! 🌟</p>
                        <p className="text-green-900/60 font-bold mt-2">No differences to analyze.</p>
                     </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
