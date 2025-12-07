"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { apiClient } from "@/lib/api-client"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, setUser } = useAppStore()

  useEffect(() => {
    const checkAuth = async () => {
      // Check if token exists
      if (!apiClient.isAuthenticated()) {
        router.push("/login")
        return
      }

      // Verify token validity by fetching current user
      if (!user) {
        try {
          const currentUser = await apiClient.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          console.error("Failed to verify authentication:", error)
          router.push("/login")
        }
      }
    }

    checkAuth()
  }, [user, router, setUser])

  // Show nothing while checking auth
  if (!user) {
    return null
  }

  return <>{children}</>
}
