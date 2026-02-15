"use client"

import Link from "next/link"
import { Terminal, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { studentProfile } from "@/lib/mock-data"

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
          <div className="hidden items-center gap-2 sm:flex">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-xs text-primary">AJ</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">{studentProfile.name}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
            <Link href="/">
              <LogOut className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
