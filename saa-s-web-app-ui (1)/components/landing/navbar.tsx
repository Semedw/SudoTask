"use client"

import Link from "next/link"
import { Terminal, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-md transform transition-transform hover:scale-105">
            <Terminal className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">SudoTask</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" className="rounded-full px-6" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" className="rounded-full px-6 shadow-md hover:scale-105 transition-transform" asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="bg-background px-6 py-4 md:hidden rounded-b-3xl shadow-lg">
          <div className="flex flex-col gap-3">
            <Link href="#features" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
              Pricing
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" className="rounded-full" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
