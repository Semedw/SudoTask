"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Eye, EyeOff, Save, ArrowLeft, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface TestCase {
  id: number
  input: string
  expectedOutput: string
  isPublic: boolean
  points: number
}

interface Criteria {
  id: number
  name: string
  points: number
}

export default function NewTaskPage() {
  const router = useRouter()
  const [tags, setTags] = useState<string[]>(["algorithms"])
  const [tagInput, setTagInput] = useState("")
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: 1, input: "", expectedOutput: "", isPublic: true, points: 10 },
  ])
  const [criteria, setCriteria] = useState<Criteria[]>([
    { id: 1, name: "Correctness", points: 70 },
    { id: 2, name: "Clean Code", points: 20 },
    { id: 3, name: "Edge Cases", points: 10 },
  ])
  const [preview, setPreview] = useState(false)

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const addTestCase = () => {
    setTestCases([
      ...testCases,
      { id: Date.now(), input: "", expectedOutput: "", isPublic: true, points: 10 },
    ])
  }

  const removeTestCase = (id: number) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((tc) => tc.id !== id))
    }
  }

  const updateTestCase = (id: number, field: keyof TestCase, value: string | boolean | number) => {
    setTestCases(testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)))
  }

  const addCriteria = () => {
    setCriteria([...criteria, { id: Date.now(), name: "", points: 0 }])
  }

  const removeCriteria = (id: number) => {
    setCriteria(criteria.filter((c) => c.id !== id))
  }

  const handleSave = () => {
    toast.success("Task saved successfully")
    router.push("/teacher/tasks")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/teacher/tasks">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Task</h1>
            <p className="text-sm text-muted-foreground">Define the task, test cases, and grading criteria</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
            <Label htmlFor="preview-toggle" className="text-xs text-muted-foreground">Preview</Label>
            <Switch id="preview-toggle" checked={preview} onCheckedChange={setPreview} />
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Task
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Task Details */}
        <div className="flex flex-col gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Task Details</CardTitle>
              <CardDescription>Define the task title, description, and difficulty</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input id="title" placeholder="e.g., Binary Search Implementation" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the task, constraints, and requirements..."
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Difficulty</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Class</Label>
                  <Select defaultValue="dsa">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dsa">Data Structures & Algorithms</SelectItem>
                      <SelectItem value="python">Introduction to Python</SelectItem>
                      <SelectItem value="web">Web Development 101</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button variant="outline" onClick={addTag}>Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Grading Criteria</CardTitle>
              <CardDescription>Define how submissions will be scored</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {criteria.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <Input
                    placeholder="Criteria name"
                    value={c.name}
                    onChange={(e) =>
                      setCriteria(criteria.map((cr) => (cr.id === c.id ? { ...cr, name: e.target.value } : cr)))
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Points"
                    value={c.points}
                    onChange={(e) =>
                      setCriteria(
                        criteria.map((cr) => (cr.id === c.id ? { ...cr, points: parseInt(e.target.value) || 0 } : cr))
                      )
                    }
                    className="w-24"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCriteria(c.id)}
                    disabled={criteria.length <= 1}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Total Points</span>
                <span className="font-bold text-foreground">{criteria.reduce((sum, c) => sum + c.points, 0)}</span>
              </div>
              <Button variant="outline" size="sm" onClick={addCriteria} className="mt-1 gap-2">
                <Plus className="h-3.5 w-3.5" />
                Add Custom Criteria
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Test Cases */}
        <div className="flex flex-col gap-6">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Test Cases</CardTitle>
                  <CardDescription>Define input/output pairs for grading</CardDescription>
                </div>
                <Button size="sm" onClick={addTestCase} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add Test Case
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {testCases.map((tc, index) => (
                <Card key={tc.id} className="border-border bg-muted/30">
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Test Case #{index + 1}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateTestCase(tc.id, "isPublic", !tc.isPublic)}
                            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {tc.isPublic ? (
                              <>
                                <Eye className="h-3 w-3" />
                                Public
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3" />
                                Hidden
                              </>
                            )}
                          </button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeTestCase(tc.id)}
                          disabled={testCases.length <= 1}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs">Input</Label>
                      <Textarea
                        placeholder="e.g., [1, 3, 5, 7, 9], 5"
                        value={tc.input}
                        onChange={(e) => updateTestCase(tc.id, "input", e.target.value)}
                        rows={2}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs">Expected Output</Label>
                      <Textarea
                        placeholder="e.g., 2"
                        value={tc.expectedOutput}
                        onChange={(e) => updateTestCase(tc.id, "expectedOutput", e.target.value)}
                        rows={2}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs">Points</Label>
                      <Input
                        type="number"
                        value={tc.points}
                        onChange={(e) => updateTestCase(tc.id, "points", parseInt(e.target.value) || 0)}
                        className="w-24"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {preview && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-foreground">Preview Mode</CardTitle>
                <CardDescription>This is how students will see the task</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Task preview shows your description, public test cases, and constraints as students would see them in the solve view.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
