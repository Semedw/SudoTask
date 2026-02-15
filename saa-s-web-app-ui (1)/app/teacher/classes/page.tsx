"use client"

import { useState } from "react"
import { Plus, Copy, Users, ExternalLink, CalendarDays } from "lucide-react"
import { toast } from "sonner"
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
import { classes } from "@/lib/mock-data"

function generateClassId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "CLS-"
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function ClassesPage() {
  const [open, setOpen] = useState(false)
  const [newClassId] = useState(generateClassId)

  const copyClassId = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success("Class ID copied to clipboard")
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
              <DialogDescription>Set up a new class and share the ID with your students.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="class-name">Class Name</Label>
                <Input id="class-name" placeholder="e.g., Introduction to Java" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="class-desc">Description</Label>
                <Textarea id="class-desc" placeholder="Brief description of the class..." rows={3} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Class ID (auto-generated)</Label>
                <div className="flex items-center gap-2">
                  <Input value={newClassId} readOnly className="font-mono" />
                  <Button variant="outline" size="icon" onClick={() => copyClassId(newClassId)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Share this ID with students so they can join</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => { setOpen(false); toast.success("Class created successfully") }}>Create Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {classes.length === 0 ? (
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
                  <Badge variant="secondary" className="shrink-0 font-mono text-xs">{cls.id}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{cls.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{cls.studentCount} students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{cls.createdAt}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => copyClassId(cls.id)}>
                    <Copy className="h-3.5 w-3.5" />
                    Copy ID
                  </Button>
                  <Button size="sm" className="flex-1 gap-1.5">
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
