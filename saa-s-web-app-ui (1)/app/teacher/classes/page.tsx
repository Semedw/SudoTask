"use client"

import { useState, useEffect } from "react"
import { Plus, Copy, Users, ExternalLink, CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { getClasses, createClass } from "@/lib/api/classes"
import { ClassRoom } from "@/lib/types"

export default function ClassesPage() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [classes, setClasses] = useState<ClassRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  async function fetchClasses() {
    try {
      setIsLoading(true)
      const data = await getClasses()
      setClasses(data)
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === "string" ? error : "Failed to fetch classes")
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateClass() {
    if (!formData.name.trim()) {
      toast.error("Please enter a class name")
      return
    }

    try {
      setIsCreating(true)
      const newClass = await createClass(formData)
      toast.success("Class created successfully")
      setClasses([newClass, ...classes])
      setOpen(false)
      setFormData({ name: "", description: "" })
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === "string" ? error : "Failed to create class")
      toast.error(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  const copyClassId = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Class code copied to clipboard")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Classes</h1>
          <p className="text-sm text-muted-foreground">Manage your classes and invite students</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>Set up a new class and share the code with your students.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="class-name">Class Name</Label>
                <Input 
                  id="class-name" 
                  placeholder="e.g., Introduction to Java" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isCreating}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="class-desc">Description</Label>
                <Textarea 
                  id="class-desc" 
                  placeholder="Brief description of the class..." 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isCreating}
                />
              </div>
              <p className="text-xs text-muted-foreground">A unique class code will be generated automatically after creation</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>Cancel</Button>
              <Button onClick={handleCreateClass} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Class"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card className="border-border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No classes yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your first class to get started</p>
            <Button className="mt-4 gap-2" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Create New Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id} className="border-border transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-foreground">{cls.name}</CardTitle>
                  <Badge variant="secondary" className="shrink-0 font-mono text-xs">{cls.class_code}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{cls.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{cls.student_count} students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{formatDate(cls.created_at)}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => copyClassId(cls.class_code)}>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Code
                  </Button>
                  <Button size="sm" className="flex-1 gap-1.5" onClick={() => router.push(`/teacher/classes/${cls.id}`)}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Class
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
