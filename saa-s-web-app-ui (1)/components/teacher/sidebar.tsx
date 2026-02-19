"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  Terminal,
  LogOut,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/useAuth"
import { useAuthStore } from "@/lib/auth/authStore"
import { toast } from "sonner"

const navItems = [
  { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { title: "Classes", href: "/teacher/classes", icon: GraduationCap },
  { title: "Tasks", href: "/teacher/tasks", icon: ClipboardList },
  { title: "Submissions", href: "/teacher/submissions", icon: FileText },
  { title: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
  { title: "Settings", href: "/teacher/settings", icon: Settings },
]

export function TeacherSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/login")
  }

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : "T"
  const fullName = user ? `${user.first_name} ${user.last_name}` : "Teacher"

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/teacher" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Terminal className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-base font-bold text-sidebar-foreground">SudoTask</span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.href === "/teacher"
                        ? pathname === "/teacher"
                        : pathname.startsWith(item.href)
                    }
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarSeparator className="mx-0 mb-3" />
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{fullName}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
