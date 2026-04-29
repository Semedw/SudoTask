"use client"

import { useEffect } from "react"
import { useAuthStore } from "./authStore"

export function useAuth() {
  const { user, isInitialized, isLoading, initialize } = useAuthStore()

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [isInitialized, initialize])

  return { user, isInitialized, isLoading }
}
