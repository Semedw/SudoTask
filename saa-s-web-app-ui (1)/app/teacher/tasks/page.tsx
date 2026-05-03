"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTasks } from "@/lib/api/tasks"
import { Task } from "@/lib/types"

const difficultyColors: Record<string, string> = {
  EASY: "bg-pastel-green text-green-900 border-0",
  MEDIUM: "bg-pastel-orange text-orange-900 border-0",
  HARD: "bg-pastel-pink text-pink-900 border-0",
}

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks() {
      try {
        setIsLoading(true)
        const data = await getTasks()
        setTasks(data)
      } catch (error: any) {
        toast.error(error.message || "Failed to load tasks")
      } finally {
        setIsLoading(false)
      }
    }
    fetchTasks()
  }, [])

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Tasks</h1>
          <p className="text-lg font-medium text-muted-foreground">Create and manage programming tasks</p>
        </div>
        <Button className="rounded-full px-8 py-8 text-lg font-bold shadow-lg hover:scale-[1.02] transition-transform" asChild>
          <Link href="/teacher/tasks/new">
            <Plus className="h-6 w-6 mr-2" />
            Add Task
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-0">
        <div className="mb-6 px-2">
          <h2 className="text-2xl font-bold text-foreground">All Tasks</h2>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-30" />
            <p className="text-lg font-bold text-muted-foreground">Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center">
             <div className="h-20 w-20 bg-secondary/50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Plus className="h-10 w-10 text-muted-foreground opacity-30" />
             </div>
             <p className="text-xl font-bold text-muted-foreground">No tasks yet.</p>
             <p className="text-muted-foreground font-medium mt-1">Create your first task to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Task Details</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Classroom</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Difficulty</TableHead>
                  <TableHead className="text-center font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Submissions</TableHead>
                  <TableHead className="text-right font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="border-0 hover:bg-secondary/20 rounded-2xl transition-colors cursor-pointer"
                    onClick={() => router.push(`/teacher/tasks/${task.id}`)}
                  >
                    <TableCell className="py-5 px-2">
                      <div className="flex flex-col gap-2">
                        <p className="text-lg font-bold text-foreground leading-tight">{task.title}</p>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag) => (
                              <Badge key={tag} className="bg-pastel-blue text-blue-900 border-0 text-[10px] font-bold h-5 uppercase">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-bold py-5">{task.classroom?.name}</TableCell>
                    <TableCell className="py-5">
                      <Badge className={`rounded-full font-bold px-3 py-1 ${difficultyColors[task.difficulty]}`}>
                        {task.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-5">
                       <span className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-secondary/50 font-bold text-sm">
                        {task.submission_count ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-5">
                       <span className="bg-secondary/50 px-4 py-1.5 rounded-full text-[11px] font-bold text-muted-foreground uppercase">
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString()
                          : "No deadline"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
