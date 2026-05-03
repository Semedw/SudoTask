"use client"

import { useEffect, useMemo, useState } from "react"
import { Users, GraduationCap, ClipboardList, Clock } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getClasses } from "@/lib/api/classes"
import { getTasks } from "@/lib/api/tasks"
import { getSubmissions } from "@/lib/api/submissions"
import type { ClassRoom, Task, Submission } from "@/lib/types"

export default function TeacherDashboardPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [classData, taskData, submissionData] = await Promise.all([
          getClasses(),
          getTasks(),
          getSubmissions(),
        ])
        setClasses(classData)
        setTasks(taskData)
        setSubmissions(submissionData)
      } catch (error: any) {
        toast.error(error?.message || "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const stats = useMemo(() => {
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.student_count || 0), 0)
    const pendingSubmissions = submissions.filter(
      (sub) => sub.status === "pending" || sub.status === "running"
    ).length

    return {
      totalClasses: classes.length,
      totalStudents,
      totalTasks: tasks.length,
      pendingSubmissions,
    }
  }, [classes, tasks, submissions])

  const statCards = [
    { title: "Total Classes", value: stats.totalClasses, icon: GraduationCap, color: "text-primary" },
    { title: "Total Students", value: stats.totalStudents, icon: Users, color: "text-chart-2" },
    { title: "Total Tasks", value: stats.totalTasks, icon: ClipboardList, color: "text-chart-3" },
    { title: "Pending Submissions", value: stats.pendingSubmissions, icon: Clock, color: "text-warning" },
  ]

  const recentClasses = classes.slice(0, 5)
  const recentSubmissions = submissions.slice(0, 5)

  const pastelColors = [
    "bg-pastel-pink text-pink-900",
    "bg-pastel-orange text-orange-900",
    "bg-pastel-green text-green-900",
    "bg-pastel-purple text-purple-900",
  ]

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Header section */}
      <div className="flex flex-col gap-4 pt-4">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground max-w-lg leading-tight">
          Teacher Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">Overview of your classes and submissions.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const colorClass = pastelColors[index % pastelColors.length]
          return (
            <div key={stat.title} className={`p-6 rounded-[2.5rem] ${colorClass} transition-transform hover:scale-[1.02] flex flex-col justify-between min-h-[160px]`}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/40 backdrop-blur-sm shadow-sm">
                  <stat.icon className="h-6 w-6 opacity-80" />
                </div>
                <p className="text-sm font-semibold opacity-80">{stat.title}</p>
              </div>
              <div className="mt-4">
                <p className="text-5xl font-bold">{isLoading ? "—" : stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mt-4">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-bold text-foreground">Recent Classes</h2>
             <Badge variant="outline" className="rounded-full bg-secondary text-secondary-foreground border-0 font-bold px-4 py-1">View All</Badge>
          </div>
          <div className="flex flex-col gap-4">
            {recentClasses.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 bg-secondary/50 rounded-3xl">
                {isLoading ? "Loading..." : "No classes yet"}
              </div>
            ) : (
              recentClasses.map((cls, idx) => (
                <div key={cls.id} className="flex items-center justify-between p-4 rounded-3xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                     <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${pastelColors[idx % pastelColors.length]}`}>
                        <GraduationCap className="h-5 w-5" />
                     </div>
                     <div>
                       <p className="font-bold text-foreground text-lg">{cls.name}</p>
                       <p className="text-sm text-muted-foreground font-mono">{cls.class_code}</p>
                     </div>
                  </div>
                  <div className="flex gap-4 text-center">
                     <div>
                        <p className="font-bold">{cls.student_count ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                     </div>
                     <div>
                        <p className="font-bold">{cls.task_count ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Tasks</p>
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-bold text-foreground">Recent Submissions</h2>
          </div>
          <div className="flex flex-col gap-4">
            {recentSubmissions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 bg-secondary/50 rounded-3xl">
                {isLoading ? "Loading..." : "No submissions yet"}
              </div>
            ) : (
              recentSubmissions.map((sub, idx) => (
                <div key={sub.id} className="flex items-center justify-between p-4 rounded-3xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                     <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${pastelColors[(idx + 2) % pastelColors.length]}`}>
                        <Users className="h-5 w-5" />
                     </div>
                     <div>
                       <p className="font-bold text-foreground text-lg">{sub.student?.username || sub.student?.email}</p>
                       <p className="text-sm text-muted-foreground truncate max-w-[200px]">{sub.task?.title}</p>
                     </div>
                  </div>
                  <div>
                    <Badge
                      className={`px-3 py-1 rounded-full font-bold ${
                         sub.status === "passed" ? "bg-success/20 text-success border-0 hover:bg-success/30" : 
                         sub.status === "failed" ? "bg-destructive/20 text-destructive border-0 hover:bg-destructive/30" : 
                         "bg-warning/20 text-warning border-0 hover:bg-warning/30"
                      }`}
                    >
                      {sub.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
