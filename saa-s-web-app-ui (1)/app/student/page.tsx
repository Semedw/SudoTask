import Link from "next/link"
import { BookOpen, User, Clock, CheckCircle2, XCircle, MinusCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { studentProfile, studentTasks } from "@/lib/mock-data"

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

export default function StudentDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{studentProfile.className}</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Student Dashboard</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>Teacher: {studentProfile.teacherName}</span>
            </div>
          </div>
          <Badge variant="outline" className="w-fit font-mono">{studentProfile.classId}</Badge>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
        <p className="text-sm text-muted-foreground">Complete your assigned programming tasks</p>
      </div>

      <div className="flex flex-col gap-3">
        {studentTasks.map((task) => {
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
                      <Badge variant="outline" className={difficultyColors[task.difficulty]}>
                        {task.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.points} points</span>
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
                    <Link href="/solve">
                      {task.status === "not-started" ? "Solve" : "View"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
