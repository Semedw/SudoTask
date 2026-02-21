"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Terminal, Eye, EyeOff, Loader2, X, ChevronLeft, GraduationCap, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuthStore } from "@/lib/auth/authStore"
import { useAuth } from "@/lib/auth/useAuth"
import { toast } from "sonner"
import {
  getSavedAccounts,
  removeSavedAccount,
  getAccountInitials,
  type SavedAccountInfo,
} from "@/lib/auth/savedAccounts"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const switchAccount = useAuthStore((state) => state.switchAccount)
  const { user, isInitialized } = useAuth()
  const [savedAccounts, setSavedAccounts] = useState<SavedAccountInfo[]>([])
  const [showManualLogin, setShowManualLogin] = useState(false)

  // Load saved accounts on mount
  useEffect(() => {
    const accounts = getSavedAccounts()
    setSavedAccounts(accounts)
  }, [])

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

  // Don't render login form if already authenticated (redirect is pending)
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleInstantSwitch = async (account: SavedAccountInfo) => {
    setIsLoading(true)
    try {
      await switchAccount(account.email)
      const u = useAuthStore.getState().user
      toast.success(`Welcome back, ${u?.first_name}!`)
      if (u?.role === "TEACHER") {
        router.push("/teacher")
      } else {
        router.push("/student")
      }
    } catch {
      // Tokens expired — remove and let them log in manually
      toast.error("Session expired. Please sign in again.")
      const updated = removeSavedAccount(account.email)
      setSavedAccounts(updated)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveAccount = (e: React.MouseEvent, email: string) => {
    e.stopPropagation()
    const updated = removeSavedAccount(email)
    setSavedAccounts(updated)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      await login(email, password)

      // Get user to determine redirect
      const user = useAuthStore.getState().user

      toast.success("Login successful!")

      // Redirect based on role
      if (user?.role === "TEACHER") {
        router.push("/teacher")
      } else if (user?.role === "STUDENT") {
        router.push("/student")
      }
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === "string" ? error : "Login failed. Please check your credentials.")
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Saved accounts + manual login view ──
  if (savedAccounts.length > 0 && !showManualLogin) {
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
              <CardTitle className="text-2xl text-foreground">Choose an account</CardTitle>
              <CardDescription>Click an account to sign in instantly</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              {savedAccounts.map((account) => (
                <div
                  key={account.email}
                  role="button"
                  tabIndex={0}
                  onClick={() => !isLoading && handleInstantSwitch(account)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !isLoading && handleInstantSwitch(account) } }}
                  className={`group flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent hover:border-accent-foreground/20 cursor-pointer ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
                    account.role === "TEACHER" ? "bg-blue-600" : "bg-emerald-600"
                  }`}>
                    {getAccountInitials(account)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {account.firstName} {account.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      account.role === "TEACHER"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}>
                      {account.role === "TEACHER" ? (
                        <BookOpen className="h-3 w-3" />
                      ) : (
                        <GraduationCap className="h-3 w-3" />
                      )}
                      {account.role === "TEACHER" ? "Teacher" : "Student"}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleRemoveAccount(e, account.email)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleRemoveAccount(e as any, account.email) } }}
                      className="rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                      title="Remove account"
                    >
                      <X className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => setShowManualLogin(true)}
              >
                Use another account
              </Button>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link href="/register" className="font-medium text-primary hover:underline">Sign up</Link>
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // ── Default login form (no saved accounts / "use another account") ──
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
          <CardHeader className="text-center relative">
            {savedAccounts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-4"
                onClick={() => setShowManualLogin(false)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
            <CardTitle className="text-2xl text-foreground">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="teacher" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="teacher">Teacher</TabsTrigger>
                <TabsTrigger value="student">Student</TabsTrigger>
              </TabsList>

              <TabsContent value="teacher">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="teacher-email">Email</Label>
                    <Input
                      id="teacher-email"
                      name="email"
                      type="email"
                      placeholder="you@university.edu"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="teacher-password">Password</Label>
                      <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="teacher-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
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
                  <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in as Teacher"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="student">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="student-email">Email</Label>
                    <Input
                      id="student-email"
                      name="email"
                      type="email"
                      placeholder="you@student.edu"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="student-password">Password</Label>
                      <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="student-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
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
                  <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in as Student"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/register" className="font-medium text-primary hover:underline">Sign up</Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
