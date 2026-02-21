"use client"

import { LandingNavbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero"
import { FeaturesSection } from "@/components/landing/features"
import { PricingSection } from "@/components/landing/pricing"
import { FooterSection } from "@/components/landing/footer"
import { useAuth } from "@/lib/auth/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function LandingPage() {
  const { user, isInitialized } = useAuth()
  const router = useRouter()

  // Auto-redirect logged-in users to their dashboard
  useEffect(() => {
    if (isInitialized && user) {
      if (user.role === "TEACHER") {
        router.replace("/teacher")
      } else if (user.role === "STUDENT") {
        router.replace("/student")
      }
    }
  }, [user, isInitialized, router])

  if (isInitialized && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <FooterSection />
    </div>
  )
}
