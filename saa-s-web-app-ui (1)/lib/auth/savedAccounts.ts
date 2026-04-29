import type { User } from "@/lib/types";

export interface SavedAccountInfo {
  email: string
  username: string
  role: string
  first_name: string
  last_name: string
  firstName?: string
  lastName?: string
}

const STORAGE_KEY = "sudotask_saved_accounts"

export function getSavedAccounts(): SavedAccountInfo[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAccount(user: User) {
  const accounts = getSavedAccounts()
  const existing = accounts.findIndex((a) => a.email === user.email)
  const entry: SavedAccountInfo = {
    email: user.email,
    username: user.username,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
    firstName: user.first_name,
    lastName: user.last_name,
  }
  if (existing >= 0) {
    accounts[existing] = entry
  } else {
    accounts.push(entry)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
}

export function removeSavedAccount(email: string): SavedAccountInfo[] {
  const accounts = getSavedAccounts().filter((a) => a.email !== email)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  return accounts
}

export function getAccountInitials(account: SavedAccountInfo): string {
  const first = account.first_name?.[0] || ""
  const last = account.last_name?.[0] || ""
  if (first || last) return `${first}${last}`.toUpperCase()
  return account.email[0].toUpperCase()
}
