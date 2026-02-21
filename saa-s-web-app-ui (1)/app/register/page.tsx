"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Terminal, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuthStore } from "@/lib/auth/authStore"
import { useAuth } from "@/lib/auth/useAuth"
import { toast } from "sonner"
import { UserRole } from "@/lib/types"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const register = useAuthStore((state) => state.register)
  const { user, isInitialized } = useAuth()

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isInitialized && user) {
      if (user.role === "TEACHER") {
        router.replace("/teacher")
      } else if (user.role === "STUDENT") {
        router.replace("/student")
      }
    }
  }, [user, isInitialized, router])

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Don't render register form if already authenticated
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, role: UserRole) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Validate password match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    // Generate username from email
    const username = email.split("@")[0]

    try {
      await register({
        email,
        username,
        password,
        password2: confirmPassword,
        role,
        first_name: firstName,
        last_name: lastName,
      })

      toast.success("Registration successful!")

      // Redirect based on role
      if (role === "TEACHER") {
        router.push("/teacher")
      } else {
        router.push("/student")
      }
    } catch (error: any) {
      const message = error.fieldErrors 
        ? Object.entries(error.fieldErrors).map(([field, errors]: [string, any]) => 
            `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`
          ).join("\n")
        : error?.message || (typeof error === "string" ? error : "Registration failed. Please try again.")
      
      toast.error(message)
    } finally {
      setIsLoading(false)
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
                  onSubmit={(e) => handleSubmit(e, "TEACHER")}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="teacher-name">Full Name</Label>
                    <Input 
                      id="teacher-name" 
                      name="fullName"
                      placeholder="Dr. Sarah Chen" 
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="teacher-reg-email">Email</Label>
                    <Input 
                      id="teacher-reg-email" 
                      name="email"
                      type="email" 
                      placeholder="you@university.edu" 
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="teacher-reg-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="teacher-reg-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        required
                        disabled={isLoading}
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="teacher-confirm-password">Confirm Password</Label>
                    <Input
                      id="teacher-confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Teacher Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="student">
                <form
                  onSubmit={(e) => handleSubmit(e, "STUDENT")}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="student-name">Full Name</Label>
                    <Input 
                      id="student-name" 
                      name="fullName"
                      placeholder="Alex Johnson" 
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="student-reg-email">Email</Label>
                    <Input 
                      id="student-reg-email" 
                      name="email"
                      type="email" 
                      placeholder="you@student.edu" 
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="student-reg-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="student-reg-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        required
                        disabled={isLoading}
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="student-confirm-password">Confirm Password</Label>
                    <Input
                      id="student-confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Student Account"}
                  </Button>
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
