"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Terminal, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

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
            <CardTitle className="text-2xl text-foreground">Create your account</CardTitle>
            <CardDescription>Get started with SudoTask in seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="teacher" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="teacher">Teacher</TabsTrigger>
                <TabsTrigger value="student">Student</TabsTrigger>
              </TabsList>

              <TabsContent value="teacher">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    router.push("/teacher")
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="teacher-name">Full Name</Label>
                    <Input id="teacher-name" placeholder="Dr. Sarah Chen" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="teacher-org">Organization</Label>
                    <Input id="teacher-org" placeholder="Stanford University" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="teacher-reg-email">Email</Label>
                    <Input id="teacher-reg-email" type="email" placeholder="you@university.edu" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="teacher-reg-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="teacher-reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="mt-2 w-full">Create Teacher Account</Button>
                </form>
              </TabsContent>

              <TabsContent value="student">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    router.push("/student")
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="student-name">Full Name</Label>
                    <Input id="student-name" placeholder="Alex Johnson" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="student-reg-email">Email</Label>
                    <Input id="student-reg-email" type="email" placeholder="you@student.edu" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="student-reg-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="student-reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="mt-2 w-full">Create Student Account</Button>
                </form>
              </TabsContent>
            </Tabs>

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
