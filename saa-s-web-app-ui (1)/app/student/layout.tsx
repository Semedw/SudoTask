"use client"

import { StudentHeader } from "@/components/student/header"
import { useAuth } from "@/lib/auth/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isInitialized || isLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "STUDENT") {
      router.push("/teacher")
    }
  }, [user, isLoading, isInitialized, router])

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== "STUDENT") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentHeader />
      <main className="mx-auto max-w-5xl px-4 py-6 lg:px-8">{children}</main>
    </div>
  )
}
