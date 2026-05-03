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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Classes</h1>
          <p className="text-lg font-medium text-muted-foreground">Manage your classes and invite students</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full px-8 py-8 text-lg font-bold shadow-lg hover:scale-[1.02] transition-transform">
              <Plus className="h-6 w-6 mr-2" />
              Create New Class
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-0 overflow-hidden max-w-lg">
            <DialogHeader className="bg-pastel-blue p-8">
              <DialogTitle className="text-2xl font-black text-blue-900">Create New Class</DialogTitle>
              <DialogDescription className="text-blue-900/60 font-bold">Set up a new workspace for your students.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-6 p-8">
              <div className="flex flex-col gap-2">
                <Label htmlFor="class-name" className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Class Name</Label>
                <Input 
                  id="class-name" 
                  placeholder="e.g., Introduction to Java" 
                  className="rounded-2xl p-6 bg-secondary/50 border-0 font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isCreating}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="class-desc" className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Description</Label>
                <Textarea 
                  id="class-desc" 
                  placeholder="Brief description of the class..." 
                  rows={3}
                  className="rounded-2xl p-6 bg-secondary/50 border-0 font-bold"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isCreating}
                />
              </div>
              <p className="text-xs text-muted-foreground font-medium px-1 italic">A unique class code will be generated automatically after creation</p>
            </div>
            <DialogFooter className="p-8 pt-0 gap-3">
              <Button variant="ghost" className="rounded-full py-6 font-bold flex-1" onClick={() => setOpen(false)} disabled={isCreating}>Cancel</Button>
              <Button className="rounded-full py-6 font-bold flex-1 shadow-md" onClick={handleCreateClass} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Class"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-[2.5rem]" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-secondary/50 flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-secondary/30 mb-6">
              <Users className="h-10 w-10 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">No classes yet</h3>
            <p className="mt-2 text-muted-foreground font-medium max-w-sm">Create your first class to get started and invite your students.</p>
            <Button className="mt-8 rounded-full px-8 py-6 font-bold shadow-md" onClick={() => setOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create New Class
            </Button>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls, idx) => {
             const colors = ['bg-pastel-blue', 'bg-pastel-pink', 'bg-pastel-green', 'bg-pastel-orange'];
             const colorClass = colors[idx % colors.length];
             return (
              <div key={cls.id} className="bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-md transition-all group border-0 flex flex-col">
                <div className={`${colorClass} rounded-[2rem] p-8 flex-1 flex flex-col`}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-black text-current leading-tight">{cls.name}</h3>
                    <Badge className="bg-white/50 text-current border-0 font-bold px-3 py-1 rounded-full">{cls.class_code}</Badge>
                  </div>
                  <p className="text-sm font-bold opacity-70 line-clamp-2 mb-6 flex-1">{cls.description}</p>
                  
                  <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest opacity-60">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{cls.student_count} Students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>{formatDate(cls.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 pt-6 flex items-center gap-3">
                  <Button variant="secondary" className="flex-1 rounded-full py-6 font-bold bg-secondary/50 border-0" onClick={() => copyClassId(cls.class_code)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button className="flex-1 rounded-full py-6 font-bold shadow-sm" onClick={() => router.push(`/teacher/classes/${cls.id}`)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
