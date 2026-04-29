"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { BookOpen, User, Clock, CheckCircle2, XCircle, MinusCircle, Plus, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getTasks } from "@/lib/api/tasks"
import { getSubmissions } from "@/lib/api/submissions"
import { joinClass, getClasses } from "@/lib/api/classes"
import { Task, Submission, ClassRoom } from "@/lib/types"
import { toast } from "sonner"

const statusConfig = {
  passed: {
    label: "Passed",
    icon: CheckCircle2,
    badgeClass: "bg-success text-success-foreground",
  },
  attempted: {
    label: "Attempted",
    icon: MinusCircle,
    badgeClass: "bg-warning text-warning-foreground",
  },
  "not-started": {
    label: "Not Started",
    icon: XCircle,
    badgeClass: "bg-muted text-muted-foreground",
  },
}

const difficultyColors: Record<string, string> = {
  Easy: "bg-success/10 text-success border-success/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Hard: "bg-destructive/10 text-destructive border-destructive/20",
}

type DisplayTask = {
  id: number
  title: string
  difficultyLabel: "Easy" | "Medium" | "Hard"
  status: "passed" | "attempted" | "not-started"
  deadline?: string | null
  points?: number
}

export default function StudentDashboardPage() {
  const [tasks, setTasks] = useState<DisplayTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [classes, setClasses] = useState<ClassRoom[]>([])
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [classCode, setClassCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [data, submissions, classData] = await Promise.all([
        getTasks(),
        getSubmissions(),
        getClasses(),
      ])

      setClasses(classData)

      // Build a map: taskId → best status ("passed" > "failed"/"error" > none)
      const statusByTask = new Map<number, "passed" | "attempted">()
      for (const sub of submissions) {
        const tid = typeof sub.task === "object" ? sub.task.id : sub.task
        if (sub.status === "passed") {
          statusByTask.set(tid, "passed")
        } else if (!statusByTask.has(tid)) {
          statusByTask.set(tid, "attempted")
        }
      }

      const mapped: DisplayTask[] = data.map((task: Task) => {
        const difficultyLabel =
          task.difficulty === "EASY" ? "Easy" : task.difficulty === "MEDIUM" ? "Medium" : "Hard"

        const taskStatus = statusByTask.get(task.id) ?? "not-started"

        return {
          id: task.id,
          title: task.title,
          difficultyLabel,
          status: taskStatus,
          deadline: task.deadline,
        }
      })

      setTasks(mapped)
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === "string" ? error : "Failed to load tasks")
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!classCode.trim()) {
      toast.error("Please enter a class code")
      return
    }

    try {
      setIsJoining(true)
      await joinClass({ class_code: classCode.trim() })
      toast.success("Successfully joined class!")
      setClassCode("")
      setJoinDialogOpen(false)
      // Refresh tasks & classes after joining
      loadData()
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === "string" ? error : "Failed to join class. Please check the code.")
      toast.error(errorMessage)
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Student Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {classes.length > 0
                ? `Enrolled in ${classes.length} class${classes.length !== 1 ? "es" : ""}`
                : "You haven't joined any classes yet"}
            </p>
          </div>
          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 w-fit">
                <Plus className="h-4 w-4" />
                Join Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleJoinClass}>
                <DialogHeader>
                  <DialogTitle>Join a Class</DialogTitle>
                  <DialogDescription>
                    Enter the class code provided by your teacher to join their class.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-4">
                  <Label htmlFor="join-class-code">Class Code</Label>
                  <Input
                    id="join-class-code"
                    placeholder="e.g. CLS-3A7K9"
                    className="font-mono uppercase"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    disabled={isJoining}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Ask your teacher for the class code if you don't have it.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setJoinDialogOpen(false)}
                    disabled={isJoining}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isJoining || !classCode.trim()}>
                    {isJoining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join Class"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Enrolled Classes */}
      {classes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground">My Classes</h2>
          <p className="text-sm text-muted-foreground mb-3">Classes you're enrolled in</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {classes.map((cls) => (
              <Card key={cls.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground truncate">{cls.name}</h3>
                      {cls.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{cls.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">{cls.class_code}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {cls.teacher.first_name} {cls.teacher.last_name}
                    </span>
                    {cls.student_count != null && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {cls.student_count} students
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
        <p className="text-sm text-muted-foreground">Complete your assigned programming tasks</p>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <Card className="border-border">
            <CardContent className="p-6 text-sm text-muted-foreground">Loading tasks...</CardContent>
          </Card>
        ) : tasks.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-6 text-sm text-muted-foreground">No tasks available.</CardContent>
          </Card>
        ) : (
          tasks.map((task) => {
          const config = statusConfig[task.status]
          return (
            <Card key={task.id} className="border-border transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    task.status === "passed" ? "bg-success/10" : task.status === "attempted" ? "bg-warning/10" : "bg-muted"
                  }`}>
                    <config.icon className={`h-4 w-4 ${
                      task.status === "passed" ? "text-success" : task.status === "attempted" ? "text-warning" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{task.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={difficultyColors[task.difficultyLabel]}>
                        {task.difficultyLabel}
                      </Badge>
                      {task.deadline && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={config.badgeClass}>{config.label}</Badge>
                  <Button size="sm" variant={task.status === "not-started" ? "default" : "outline"} asChild>
                    <Link href={`/solve?taskId=${task.id}`}>
                      {task.status === "not-started" ? "Solve" : "View"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })
        )}
      </div>
    </div>
  )
}
