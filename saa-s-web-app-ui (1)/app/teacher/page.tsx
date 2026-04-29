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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your classes and submissions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Classes</CardTitle>
            <CardDescription>Your most recently created classes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Tasks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      {isLoading ? "Loading..." : "No classes yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  recentClasses.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium text-foreground">{cls.name}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{cls.student_count ?? 0}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{cls.task_count ?? 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Submissions</CardTitle>
            <CardDescription>Latest student submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      {isLoading ? "Loading..." : "No submissions yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  recentSubmissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium text-foreground">{sub.student?.username || sub.student?.email}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-muted-foreground">{sub.task?.title}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={sub.status === "passed" ? "default" : sub.status === "failed" ? "destructive" : "secondary"}
                          className={sub.status === "passed" ? "bg-success text-success-foreground" : ""}
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
