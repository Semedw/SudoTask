"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Clipboard, CalendarDays, ListChecks } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getClass } from "@/lib/api/classes"
import { getTasks } from "@/lib/api/tasks"
import { ClassRoom, Task } from "@/lib/types"

export default function TeacherClassDetailsPage() {
	const router = useRouter()
	const params = useParams()
	const classId = useMemo(() => Number(params?.id), [params])

	const [classroom, setClassroom] = useState<ClassRoom | null>(null)
	const [tasks, setTasks] = useState<Task[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		if (!classId || Number.isNaN(classId)) {
			toast.error("Invalid class id")
			router.push("/teacher/classes")
			return
		}

		const load = async () => {
			try {
				setIsLoading(true)
				const [classData, taskData] = await Promise.all([
					getClass(classId),
					getTasks(classId),
				])
				setClassroom(classData)
				setTasks(Array.isArray(taskData) ? taskData : [])
			} catch (error: any) {
				const errorMessage = error?.message || (typeof error === "string" ? error : "Failed to load class")
				toast.error(errorMessage)
				router.push("/teacher/classes")
			} finally {
				setIsLoading(false)
			}
		}

		load()
	}, [classId, router])

	const formatDate = (dateString?: string) => {
		if (!dateString) return ""
		const date = new Date(dateString)
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
	}

	const copyClassCode = (code?: string) => {
		if (!code) return
		navigator.clipboard.writeText(code)
		toast.success("Class code copied")
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex items-center gap-3">
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-6 w-48" />
				</div>
				<div className="grid gap-4 lg:grid-cols-3">
					<Skeleton className="h-36" />
					<Skeleton className="h-36" />
					<Skeleton className="h-36" />
				</div>
				<Skeleton className="h-64" />
			</div>
		)
	}

	if (!classroom) return null

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<Button variant="outline" size="sm" onClick={() => router.push("/teacher/classes")}
						className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back
					</Button>
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">{classroom.name}</h1>
						<p className="text-sm text-muted-foreground">{classroom.description || "No description"}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant="secondary" className="font-mono text-xs">{classroom.class_code}</Badge>
					<Button variant="outline" size="sm" onClick={() => copyClassCode(classroom.class_code)} className="gap-2">
						<Clipboard className="h-4 w-4" />
						Copy Code
					</Button>
				</div>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<Card className="border-border">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-semibold text-foreground">{classroom.student_count ?? 0}</div>
					</CardContent>
				</Card>
				<Card className="border-border">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Tasks</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-semibold text-foreground">{tasks.length}</div>
					</CardContent>
				</Card>
				<Card className="border-border">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 text-foreground">
							<CalendarDays className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm">{formatDate(classroom.created_at)}</span>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="border-border">
				<CardHeader>
					<CardTitle className="text-foreground">Class Tasks</CardTitle>
					<CardDescription>Manage tasks for this class.</CardDescription>
				</CardHeader>
				<CardContent>
					{tasks.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-10 text-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
								<ListChecks className="h-6 w-6 text-muted-foreground" />
							</div>
							<h3 className="mt-4 text-lg font-semibold text-foreground">No tasks yet</h3>
							<p className="mt-1 text-sm text-muted-foreground">Create your first task to get started</p>
							<Button className="mt-4" onClick={() => router.push("/teacher/tasks")}>Go to Tasks</Button>
						</div>
					) : (
						<div className="grid gap-3">
							{tasks.map((task) => (
								<div key={task.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
									<div className="min-w-0">
										<p className="truncate font-medium text-foreground">{task.title}</p>
										<p className="truncate text-sm text-muted-foreground">{task.description}</p>
									</div>
									<Button size="sm" variant="outline" onClick={() => router.push(`/teacher/tasks/${task.id}`)}>
										Open
									</Button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
