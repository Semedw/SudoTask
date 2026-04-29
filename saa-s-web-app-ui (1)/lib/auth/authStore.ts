import { create } from "zustand"
import type { User } from "@/lib/types"
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  logout as apiLogout,
} from "@/lib/api/auth"
import { saveAccount } from "@/lib/auth/savedAccounts"

interface AuthState {
  user: User | null
  isInitialized: boolean
  isLoading: boolean

  initialize: () => Promise<void>

  login: (email: string, password: string) => Promise<User>

  register: (payload: {
    email: string
    username: string
    password: string
    password2: string
    role: string
    first_name: string
    last_name: string
  }) => Promise<User>

  logout: () => Promise<void>

  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,
  isLoading: false,

  initialize: async () => {
    try {
      const user = await getMe()
      set({ user, isInitialized: true })
    } catch {
      set({ user: null, isInitialized: true })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      await apiLogin({ email, password })
      const user = await getMe()
      set({ user, isLoading: false })
      saveAccount(user)
      return user
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (payload) => {
    set({ isLoading: true })
    try {
      await apiRegister(payload)
      const user = await getMe()
      set({ user, isLoading: false })
      saveAccount(user)
      return user
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: async () => {
    await apiLogout()
    set({ user: null })
  },

  setUser: (user) => set({ user }),
}))
