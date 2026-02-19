"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { joinClass } from "@/lib/api/classes"
import { toast } from "sonner"

export default function StudentJoinPage() {
  const router = useRouter()
  const [isJoining, setIsJoining] = useState(false)
  const [classCode, setClassCode] = useState("")

  async function handleJoinClass(e: React.FormEvent) {
    e.preventDefault()
    
    if (!classCode.trim()) {
      toast.error("Please enter a class code")
      return
    }

    try {
      setIsJoining(true)
      await joinClass({ class_code: classCode.trim() })
      toast.success("Successfully joined class!")
      router.push("/student")
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === "string" ? error : "Failed to join class. Please check the code.")
      toast.error(errorMessage)
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Terminal className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">SudoTask</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Join a Class</CardTitle>
            <CardDescription>Enter the class code provided by your teacher</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinClass} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="class-code">Class Code</Label>
                <Input 
                  id="class-code" 
                  placeholder="CLS-3A7K9" 
                  className="font-mono uppercase" 
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  required
                  disabled={isJoining}
                />
                <p className="text-xs text-muted-foreground">Ask your teacher for the class code</p>
              </div>
              <Button type="submit" className="mt-2 w-full" disabled={isJoining}>
                {isJoining ? "Joining..." : "Join Class"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
