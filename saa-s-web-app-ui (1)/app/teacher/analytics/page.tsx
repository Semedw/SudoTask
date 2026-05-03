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
  "#FFD1DC", // Pastel Pink
  "#B2E2F2", // Pastel Blue
  "#C1E1C1", // Pastel Green
  "#FFE5B4", // Pastel Orange
  "#E6E6FA", // Lavender
  "#FDFD96", // Pastel Yellow
]

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Analytics</h1>
        <p className="text-lg font-medium text-muted-foreground">Track performance, identify trends, and improve outcomes</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Task Completion Rate */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Task Completion Rate</h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">Weekly completed vs attempted tasks</p>
          </div>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskCompletionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "0",
                    borderRadius: "16px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attempted"
                  stroke="#94a3b8"
                  strokeWidth={4}
                  dot={{ r: 6, fill: "#94a3b8", strokeWidth: 0 }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  name="Attempted"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--primary)"
                  strokeWidth={4}
                  dot={{ r: 6, fill: "var(--primary)", strokeWidth: 0 }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Performance Distribution */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Score Distribution</h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">Student performance across all tasks</p>
          </div>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="range" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} 
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "0",
                    borderRadius: "16px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#B2E2F2"
                  radius={[12, 12, 12, 12]}
                  name="Students"
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Failed Test Cases */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Common Failure Points</h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">Test cases where students struggle most</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={failedTestCasesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="count"
                  nameKey="name"
                >
                  {failedTestCasesData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "0",
                    borderRadius: "16px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {failedTestCasesData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <div
                  className="h-3 w-3 rounded-full shadow-sm"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                {item.name}
              </div>
            ))}
          </div>
        </div>

        {/* Student Performance Table */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Student Performance</h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">Individual scores and activity tracking</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Student</TableHead>
                  <TableHead className="text-center font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Score</TableHead>
                  <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Most Failed</TableHead>
                  <TableHead className="text-right font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentAnalyticsTable.map((student) => (
                  <TableRow key={student.name} className="border-0 hover:bg-secondary/20 rounded-2xl transition-colors">
                    <TableCell className="font-bold text-foreground py-4 px-2">{student.name}</TableCell>
                    <TableCell className="text-center py-4">
                      <span
                        className={`inline-flex items-center justify-center h-10 w-10 rounded-2xl font-bold text-sm shadow-sm ${
                          student.score >= 80
                            ? "bg-pastel-green text-green-900"
                            : student.score >= 60
                            ? "bg-pastel-orange text-orange-900"
                            : "bg-pastel-pink text-pink-900"
                        }`}
                      >
                        {student.score}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium py-4 italic">{student.mostFailed}</TableCell>
                    <TableCell className="text-right py-4">
                       <span className="bg-secondary/50 px-3 py-1 rounded-full text-[10px] font-bold text-muted-foreground uppercase">{student.lastSubmission}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
