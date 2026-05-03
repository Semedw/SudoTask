"use client"

import { useAuth } from "@/lib/auth/useAuth"
import { AccountSwitcher } from "@/components/account-switcher"
import { Bell, Settings } from "lucide-react"

export function RightPanel({ children }: { children?: React.ReactNode }) {
  const { user } = useAuth()

  if (!user) return null

  const fullName = `${user.first_name} ${user.last_name}`

  return (
    <aside className="w-[340px] hidden xl:flex flex-col gap-6 pl-4 sticky top-4 h-[calc(100vh-2rem)]">
      {/* Top section: User profile & quick actions */}
      <div className="rounded-[2.5rem] bg-sidebar p-6 shadow-sm flex flex-col items-center relative shrink-0">
        <div className="absolute top-6 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-muted-foreground hover:text-foreground cursor-pointer transition-transform hover:scale-105">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"></span>
        </div>
        <div className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-muted-foreground hover:text-foreground cursor-pointer transition-transform hover:scale-105">
          <Settings className="h-5 w-5" />
        </div>
        
        <div className="mt-14 mb-4">
           <AccountSwitcher variant="compact" />
        </div>
        
        <h2 className="text-xl font-bold text-foreground tracking-tight">{fullName}</h2>
        <p className="text-sm text-muted-foreground capitalize mt-1">{user.role.toLowerCase()}</p>
        
        <div className="mt-8 flex items-center justify-center gap-6 w-full px-4">
           <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">12</span>
              <span className="text-xs text-muted-foreground">Tasks</span>
           </div>
           <div className="h-10 w-[1px] bg-border"></div>
           <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-pastel-orange">4.8</span>
              <span className="text-xs text-muted-foreground">Rating</span>
           </div>
        </div>
      </div>

      {/* Custom children for extra panels like My Courses or Activity */}
      {children && (
        <div className="flex-1 overflow-y-auto rounded-[2.5rem] bg-sidebar p-6 shadow-sm min-h-0 custom-scrollbar">
           {children}
        </div>
      )}
    </aside>
  )
}
