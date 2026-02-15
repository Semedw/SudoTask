"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  taskCompletionData,
  failedTestCasesData,
  studentPerformanceData,
  studentAnalyticsTable,
} from "@/lib/mock-data"

const CHART_COLORS = [
  "hsl(217, 91%, 50%)",
  "hsl(168, 65%, 45%)",
  "hsl(30, 85%, 55%)",
  "hsl(220, 10%, 46%)",
  "hsl(0, 84%, 60%)",
  "hsl(280, 65%, 55%)",
]

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track performance, identify trends, and improve outcomes</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Completion Rate */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Task Completion Rate</CardTitle>
            <CardDescription>Weekly completed vs attempted tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="attempted"
                    stroke="hsl(220, 10%, 46%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(220, 10%, 46%)", r: 4 }}
                    name="Attempted"
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(217, 91%, 50%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(217, 91%, 50%)", r: 4 }}
                    name="Completed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Student Performance Distribution */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Score Distribution</CardTitle>
            <CardDescription>Student performance across all tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="range" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(217, 91%, 50%)"
                    radius={[4, 4, 0, 0]}
                    name="Students"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Most Failed Test Cases */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Most Failed Test Cases</CardTitle>
            <CardDescription>Common failure points across all tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={failedTestCasesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                  >
                    {failedTestCasesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {failedTestCasesData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  {item.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Performance Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Student Performance</CardTitle>
            <CardDescription>Individual student scores and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead>Most Failed</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentAnalyticsTable.map((student) => (
                  <TableRow key={student.name}>
                    <TableCell className="font-medium text-foreground">{student.name}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-medium ${
                          student.score >= 80
                            ? "text-success"
                            : student.score >= 60
                            ? "text-warning"
                            : "text-destructive"
                        }`}
                      >
                        {student.score}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{student.mostFailed}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{student.lastSubmission}</TableCell>
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
