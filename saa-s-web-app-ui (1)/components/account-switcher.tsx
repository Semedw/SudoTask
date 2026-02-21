"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, LogOut, Plus, X, GraduationCap, BookOpen, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth/useAuth"
import { useAuthStore } from "@/lib/auth/authStore"
import {
  getSavedAccounts,
  removeSavedAccount,
  getAccountInitials,
  type SavedAccountInfo,
} from "@/lib/auth/savedAccounts"
import { toast } from "sonner"

interface AccountSwitcherProps {
  /** Show the full name + email or just the avatar */
  variant?: "full" | "compact"
}

export function AccountSwitcher({ variant = "full" }: AccountSwitcherProps) {
  const { user } = useAuth()
  const switchAccount = useAuthStore((state) => state.switchAccount)
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()
  const [savedAccounts, setSavedAccounts] = useState<SavedAccountInfo[]>([])
  const [switching, setSwitching] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setSavedAccounts(getSavedAccounts())
  }, [open]) // refresh list every time dropdown opens

  if (!user) return null

  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U"
  const fullName = `${user.first_name} ${user.last_name}`
  const otherAccounts = savedAccounts.filter((a) => a.email !== user.email)

  const handleSwitch = async (email: string) => {
    setSwitching(true)
    try {
      await switchAccount(email)
      const updated = useAuthStore.getState().user
      toast.success(`Switched to ${updated?.first_name} ${updated?.last_name}`)
      // Redirect to the correct dashboard
      if (updated?.role === "TEACHER") {
        router.push("/teacher")
      } else {
        router.push("/student")
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to switch account")
      // If session expired, remove the account and redirect to login
      removeSavedAccount(email)
      setSavedAccounts(getSavedAccounts())
    } finally {
      setSwitching(false)
      setOpen(false)
    }
  }

  const handleRemove = (e: React.MouseEvent, email: string) => {
    e.stopPropagation()
    e.preventDefault()
    const updated = removeSavedAccount(email)
    setSavedAccounts(updated)
    toast.success("Account removed")
  }

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/login")
  }

  const handleAddAccount = () => {
    // Log out the current session but keep saved accounts,
    // then go to login so the user can sign in with another account
    logout()
    router.push("/login")
  }

  const avatarColor = user.role === "TEACHER" ? "bg-blue-600" : "bg-emerald-600"

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {variant === "full" ? (
          <button className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-accent outline-none">
            <Avatar className="h-7 w-7">
              <AvatarFallback className={`${avatarColor} text-[11px] font-semibold text-white`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-foreground sm:block max-w-[120px] truncate">
              {fullName}
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
          </button>
        ) : (
          <button className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-accent outline-none">
            <Avatar className="h-7 w-7">
              <AvatarFallback className={`${avatarColor} text-[11px] font-semibold text-white`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        {switching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}

        {/* Current account */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className={`${avatarColor} text-xs font-semibold text-white`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              user.role === "TEACHER"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            }`}>
              {user.role === "TEACHER" ? "Teacher" : "Student"}
            </span>
          </div>
        </DropdownMenuLabel>

        {/* Other saved accounts */}
        {otherAccounts.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal py-1">
              Switch account
            </DropdownMenuLabel>
            {otherAccounts.map((account) => (
              <DropdownMenuItem
                key={account.email}
                className="group flex items-center gap-3 cursor-pointer p-2"
                onSelect={(e) => {
                  e.preventDefault()
                  handleSwitch(account.email)
                }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`text-[11px] font-semibold text-white ${
                    account.role === "TEACHER" ? "bg-blue-600" : "bg-emerald-600"
                  }`}>
                    {getAccountInitials(account)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {account.firstName} {account.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    account.role === "TEACHER"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}>
                    {account.role === "TEACHER" ? "T" : "S"}
                  </span>
                  <button
                    onClick={(e) => handleRemove(e, account.email)}
                    className="rounded-full p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    title="Remove account"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onSelect={(e) => {
            e.preventDefault()
            handleAddAccount()
          }}
        >
          <Plus className="h-4 w-4" />
          Add another account
        </DropdownMenuItem>

        <DropdownMenuItem
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
          onSelect={(e) => {
            e.preventDefault()
            handleLogout()
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
