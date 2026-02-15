import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { tasks } from "@/lib/mock-data"

const difficultyColors: Record<string, string> = {
  Easy: "bg-success/10 text-success border-success/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Hard: "bg-destructive/10 text-destructive border-destructive/20",
}

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">Create and manage programming tasks</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/teacher/tasks/new">
            <Plus className="h-4 w-4" />
            Add Task
          </Link>
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-center">Points</TableHead>
                <TableHead className="text-center">Submissions</TableHead>
                <TableHead>Pass Rate</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{task.title}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs font-normal">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{task.className}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={difficultyColors[task.difficulty]}>
                      {task.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-foreground">{task.points}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{task.submissions}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={task.passRate} className="h-2 w-16" />
                      <span className="text-xs text-muted-foreground">{task.passRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{task.deadline || "No deadline"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
