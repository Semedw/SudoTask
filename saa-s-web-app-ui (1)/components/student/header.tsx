"use client"

import Link from "next/link"
import { Terminal } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccountSwitcher } from "@/components/account-switcher"

export function StudentHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 lg:px-8">
        <Link href="/student" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Terminal className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold text-foreground">SudoTask</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AccountSwitcher variant="full" />
        </div>
      </nav>
    </header>
  )
}
