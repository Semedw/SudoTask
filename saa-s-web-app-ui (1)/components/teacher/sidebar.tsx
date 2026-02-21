"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  Terminal,
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
import { AccountSwitcher } from "@/components/account-switcher"

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
        <AccountSwitcher variant="full" />
      </SidebarFooter>
    </Sidebar>
  )
}
