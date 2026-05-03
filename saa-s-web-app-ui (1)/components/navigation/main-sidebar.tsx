"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Terminal, Home, BookOpen, Calendar, LayoutGrid, Settings, CheckSquare } from "lucide-react"
import { useAuth } from "@/lib/auth/useAuth"

const studentLinks = [
  { href: "/student", icon: Home, label: "Dashboard" },
  { href: "/student/classes", icon: BookOpen, label: "My Classes" },
  { href: "/student/tasks", icon: LayoutGrid, label: "Tasks" },
  { href: "/student/calendar", icon: Calendar, label: "Calendar" },
]

const teacherLinks = [
  { href: "/teacher", icon: Home, label: "Dashboard" },
  { href: "/teacher/classes", icon: BookOpen, label: "Classes" },
  { href: "/teacher/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/teacher/analytics", icon: LayoutGrid, label: "Analytics" },
  { href: "/teacher/settings", icon: Settings, label: "Settings" },
]

export function MainSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const links = user.role === "TEACHER" ? teacherLinks : studentLinks

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-24 rounded-[2.5rem] bg-sidebar flex flex-col items-center py-8 shadow-sm z-50">
      <Link href="/" className="mb-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary transform transition-transform hover:scale-105 shadow-md">
          <Terminal className="h-6 w-6 text-primary-foreground" />
        </div>
      </Link>

      <nav className="flex flex-col gap-6 w-full items-center">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/") && link.href !== "/student" && link.href !== "/teacher"
          const isExact = pathname === link.href
          const active = isActive && !(pathname.startsWith("/student/classes") && link.href === "/student")
          
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                active || isExact
                  ? "bg-primary text-primary-foreground shadow-md scale-110"
                  : "text-muted-foreground hover:bg-black/5 hover:text-foreground hover:scale-105"
              }`}
              title={link.label}
            >
              <Icon className="h-5 w-5" strokeWidth={active || isExact ? 2.5 : 2} />
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <AccountSettingsLink />
      </div>
    </aside>
  )
}

function AccountSettingsLink() {
  const { user } = useAuth()
  const href = user?.role === "TEACHER" ? "/teacher/settings" : "/student/settings"
  return (
    <Link
      href={href}
      className="flex h-12 w-12 items-center justify-center rounded-full text-muted-foreground hover:bg-black/5 hover:text-foreground transition-all duration-300 hover:scale-105"
    >
      <Settings className="h-5 w-5" />
    </Link>
  )
}
