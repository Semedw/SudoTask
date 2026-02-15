"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Play, Send, Clock, CheckCircle2, XCircle, Terminal } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { solveTaskData } from "@/lib/mock-data"

export default function SolveTaskPage() {
  const [code, setCode] = useState(solveTaskData.starterCode)
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState("console")

  const handleRun = () => {
    toast.info("Running your code...")
    setTimeout(() => {
      setShowResults(true)
      setActiveTab("results")
      toast.success("Code execution complete")
    }, 1000)
  }

  const handleSubmit = () => {
    toast.info("Submitting your solution...")
    setTimeout(() => {
      setShowResults(true)
      setActiveTab("results")
      toast.success("Solution submitted! Score: 60/100")
    }, 1500)
  }

  const totalPoints = solveTaskData.testCases.reduce((sum, tc) => sum + tc.points, 0)
  const earnedPoints = solveTaskData.testCases
    .filter((tc) => tc.passed)
    .reduce((sum, tc) => sum + tc.points, 0)

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
            <h1 className="truncate text-sm font-semibold text-foreground">{solveTaskData.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <Clock className="h-3 w-3" />
            <span>25:00</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left Panel - Task Description */}
        <div className="flex w-full flex-col border-b border-border lg:w-[400px] lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Description</h2>
                <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {solveTaskData.description}
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-sm font-semibold text-foreground">Constraints</h2>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {solveTaskData.constraints.map((c, i) => (
                    <li key={i} className="text-sm text-muted-foreground font-mono">
                      {"- "}{c}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h2 className="text-sm font-semibold text-foreground">Examples</h2>
                <div className="mt-2 flex flex-col gap-3">
                  {solveTaskData.examples.map((ex, i) => (
                    <Card key={i} className="border-border bg-muted/30">
                      <CardContent className="p-3 text-sm">
                        <div className="flex flex-col gap-1">
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Input: </span>
                            <code className="font-mono">{ex.input}</code>
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Output: </span>
                            <code className="font-mono">{ex.output}</code>
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{ex.explanation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor & Results */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Editor Toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
            <Select defaultValue="python">
              <SelectTrigger className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleRun}>
                <Play className="h-3.5 w-3.5" />
                Run
              </Button>
              <Button size="sm" className="gap-1.5" onClick={handleSubmit}>
                <Send className="h-3.5 w-3.5" />
                Submit
              </Button>
            </div>
          </div>

          {/* Code Editor (Mock) */}
          <div className="flex-1 overflow-hidden bg-[hsl(220,20%,8%)]">
            <div className="flex h-full">
              <div className="hidden w-12 shrink-0 flex-col items-end overflow-hidden py-4 pr-3 text-xs leading-[1.625rem] text-[hsl(220,10%,35%)] sm:flex">
                {code.split("\n").map((_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full resize-none bg-transparent p-4 font-mono text-sm leading-[1.625rem] text-[hsl(220,14%,85%)] outline-none selection:bg-[hsl(217,91%,50%,0.3)] sm:pl-0"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Bottom Panel - Results */}
          <div className="h-[240px] shrink-0 border-t border-border">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
              <TabsList className="h-auto w-full justify-start rounded-none border-b border-border bg-transparent px-2 py-0">
                <TabsTrigger value="console" className="rounded-none border-b-2 border-transparent py-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                  Console
                </TabsTrigger>
                <TabsTrigger value="results" className="rounded-none border-b-2 border-transparent py-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                  Results
                  {showResults && (
                    <Badge variant="secondary" className="ml-1.5 text-xs">{earnedPoints}/{totalPoints}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="testcases" className="rounded-none border-b-2 border-transparent py-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                  Test Cases
                </TabsTrigger>
              </TabsList>

              <TabsContent value="console" className="flex-1 overflow-y-auto p-4">
                <p className="text-sm text-muted-foreground">Run your code to see output here.</p>
              </TabsContent>

              <TabsContent value="results" className="flex-1 overflow-y-auto p-4">
                {showResults ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        Score: {earnedPoints}/{totalPoints}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({solveTaskData.testCases.filter((tc) => tc.passed).length}/{solveTaskData.testCases.length} tests passed)
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {solveTaskData.testCases.map((tc, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                            tc.passed
                              ? "border-success/30 bg-success/5"
                              : "border-destructive/30 bg-destructive/5"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {tc.passed ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <span className="text-foreground">Test #{i + 1}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{tc.points} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Submit your code to see results.</p>
                )}
              </TabsContent>

              <TabsContent value="testcases" className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-2">
                  {solveTaskData.testCases.slice(0, 3).map((tc, i) => (
                    <div key={i} className="rounded-md border border-border p-2 text-xs">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Input: </span>
                        <code className="font-mono">{tc.input}</code>
                      </p>
                      <p className="mt-0.5 text-muted-foreground">
                        <span className="font-medium text-foreground">Expected: </span>
                        <code className="font-mono">{tc.expectedOutput}</code>
                      </p>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    + {solveTaskData.testCases.length - 3} hidden test cases
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
