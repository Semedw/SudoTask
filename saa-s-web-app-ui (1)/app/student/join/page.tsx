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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-sm transform transition-transform hover:scale-105">
            <Terminal className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">SudoTask</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-md border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden p-2">
          <CardHeader className="text-center pt-10 pb-6 px-8">
            <CardTitle className="text-3xl font-black text-foreground mb-2">Join a Class</CardTitle>
            <CardDescription className="text-lg font-medium">Enter the class code provided by your teacher</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleJoinClass} className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Label htmlFor="class-code" className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Class Code</Label>
                <Input 
                  id="class-code" 
                  placeholder="CLS-3A7K9" 
                  className="rounded-2xl p-8 bg-secondary/50 border-0 font-mono font-bold text-xl uppercase text-center placeholder:text-muted-foreground/30 focus-visible:ring-pastel-blue" 
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  required
                  disabled={isJoining}
                />
                <p className="text-xs text-muted-foreground text-center font-medium mt-1 italic">Ask your teacher for the 8-character class code</p>
              </div>
              <Button type="submit" className="mt-2 w-full rounded-full py-8 text-xl font-bold shadow-lg hover:scale-[1.02] transition-transform" disabled={isJoining}>
                {isJoining ? "Joining..." : "Join Class"}
              </Button>
            </form>
            <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
              {"Want to go back? "}
              <Link href="/student" className="font-bold text-primary hover:underline">Return to Dashboard</Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
