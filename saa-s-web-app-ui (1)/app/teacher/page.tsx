import { Users, GraduationCap, ClipboardList, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { summaryStats, classes, recentSubmissions } from "@/lib/mock-data"

const statCards = [
  { title: "Total Classes", value: summaryStats.totalClasses, icon: GraduationCap, color: "text-primary" },
  { title: "Total Students", value: summaryStats.totalStudents, icon: Users, color: "text-chart-2" },
  { title: "Total Tasks", value: summaryStats.totalTasks, icon: ClipboardList, color: "text-chart-3" },
  { title: "Pending Submissions", value: summaryStats.pendingSubmissions, icon: Clock, color: "text-warning" },
]

export default function TeacherDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, Dr. Sarah Chen. Here is an overview of your classes.</p>
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
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
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
                {classes.slice(0, 5).map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium text-foreground">{cls.name}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{cls.studentCount}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{cls.taskCount}</TableCell>
                  </TableRow>
                ))}
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
                {recentSubmissions.slice(0, 5).map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium text-foreground">{sub.studentName}</TableCell>
                    <TableCell className="max-w-[150px] truncate text-muted-foreground">{sub.taskName}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={sub.status === "passed" ? "default" : "destructive"}
                        className={sub.status === "passed" ? "bg-success text-success-foreground" : ""}
                      >
                        {sub.status === "passed" ? "Passed" : "Failed"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
