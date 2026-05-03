"use client"

import { useAuth } from "@/lib/auth/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { MainSidebar } from "@/components/navigation/main-sidebar"
import { RightPanel } from "@/components/navigation/right-panel"

export default function TeacherLayout({
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

    if (user.role !== "TEACHER") {
      router.push("/student")
    }
  }, [user, isLoading, isInitialized, router])

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== "TEACHER") {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background pl-[120px] pr-4 py-4 gap-6">
      <MainSidebar />
      <main className="flex-1 min-w-0 max-w-5xl mx-auto pt-2">{children}</main>
      <RightPanel />
    </div>
  )
}
