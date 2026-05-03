"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { BookOpen, User, Clock, CheckCircle2, XCircle, MinusCircle, Plus, Loader2, LayoutGrid } from "lucide-react"
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

  const pastelColors = [
    "bg-pastel-pink text-pink-900",
    "bg-pastel-orange text-orange-900",
    "bg-pastel-purple text-purple-900",
    "bg-pastel-green text-green-900",
    "bg-pastel-blue text-blue-900"
  ]

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Header section matching the image */}
      <div className="flex flex-col gap-8 pt-4">
        <div className="flex justify-between items-start">
           <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground max-w-lg leading-tight">
             Invest in your education
           </h1>
           <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:scale-105 transition-transform shadow-md">
                <Plus className="h-5 w-5" />
                Join Class
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl p-6">
              <form onSubmit={handleJoinClass}>
                <DialogHeader>
                  <DialogTitle className="text-2xl">Join a Class</DialogTitle>
                  <DialogDescription>
                    Enter the class code provided by your teacher.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-6">
                  <Input
                    id="join-class-code"
                    placeholder="e.g. CLS-3A7K9"
                    className="font-mono uppercase text-lg p-6 rounded-2xl bg-secondary/50 border-0"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    disabled={isJoining}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setJoinDialogOpen(false)} disabled={isJoining} className="rounded-full">Cancel</Button>
                  <Button type="submit" disabled={isJoining || !classCode.trim()} className="rounded-full px-8">
                    {isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Join Class"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium whitespace-nowrap flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" /> All Tasks
          </button>
          <button className="px-6 py-3 rounded-full bg-secondary text-secondary-foreground hover:bg-black/5 font-medium whitespace-nowrap flex items-center gap-2 transition-colors">
            <CheckCircle2 className="h-4 w-4 text-success" /> Passed
          </button>
          <button className="px-6 py-3 rounded-full bg-secondary text-secondary-foreground hover:bg-black/5 font-medium whitespace-nowrap flex items-center gap-2 transition-colors">
            <MinusCircle className="h-4 w-4 text-warning" /> Attempted
          </button>
          <button className="px-6 py-3 rounded-full bg-secondary text-secondary-foreground hover:bg-black/5 font-medium whitespace-nowrap flex items-center gap-2 transition-colors">
            <XCircle className="h-4 w-4 text-muted-foreground" /> Not Started
          </button>
        </div>
      </div>

      {/* Most Popular (Tasks) */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-6">Your Tasks</h2>
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center rounded-[2.5rem] bg-secondary text-muted-foreground">
             No tasks available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.map((task, index) => {
              const colorClass = pastelColors[index % pastelColors.length]
              const config = statusConfig[task.status]
              return (
                <Link href={`/solve?taskId=${task.id}`} key={task.id} className="block group">
                  <div className={`p-8 rounded-[2.5rem] ${colorClass} transition-all duration-300 transform group-hover:scale-[1.02] hover:shadow-xl flex flex-col justify-between min-h-[240px]`}>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full">
                          <config.icon className={`h-4 w-4 ${task.status === 'passed' ? 'text-green-700' : task.status === 'attempted' ? 'text-orange-700' : 'text-slate-700'}`} />
                          <span className="text-sm font-semibold">{config.label}</span>
                       </div>
                       <div className="flex items-center gap-1 bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-sm">
                          {task.difficultyLabel}
                       </div>
                    </div>
                    
                    <h3 className="text-3xl font-bold mt-6 mb-8 leading-tight line-clamp-2">
                      {task.title}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-auto">
                       <span className="text-sm font-medium opacity-80 flex items-center gap-2">
                          {task.deadline ? <><Clock className="h-4 w-4" /> {task.deadline}</> : "No deadline"}
                       </span>
                       <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full border-2 border-white/50 bg-white/30 flex items-center justify-center"><User className="h-4 w-4" /></div>
                          <div className="w-8 h-8 rounded-full border-2 border-white/50 bg-white/30 flex items-center justify-center"><User className="h-4 w-4" /></div>
                       </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Enrolled Classes - Using horizontal cards to mimic "My courses" */}
      {classes.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-bold text-foreground mb-6">My Classes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {classes.map((cls, index) => {
              const colorClass = pastelColors[(index + 2) % pastelColors.length]
              return (
                <div key={cls.id} className={`p-6 rounded-3xl ${colorClass} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-transform hover:scale-[1.02] cursor-pointer`}>
                  <div className="flex items-center gap-4">
                     <div className="h-14 w-14 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center shrink-0">
                        <BookOpen className="h-6 w-6" />
                     </div>
                     <div>
                       <h3 className="text-xl font-bold">{cls.name}</h3>
                       <p className="text-sm font-medium opacity-80 mt-1">{cls.teacher.first_name} {cls.teacher.last_name}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full font-mono text-sm font-bold">
                    {cls.class_code}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

