"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { getAPIClient } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, fetchUser } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const apiClient = getAPIClient()
      
      // Check if we have a token
      if (!apiClient.isAuthenticated()) {
        // No token, redirect to login
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        return
      }

      // We have a token, but no user data in store
      if (!user) {
        try {
          await fetchUser()
          setIsLoading(false)
        } catch (error) {
          console.error("Failed to fetch user:", error)
          // Token might be invalid, redirect to login
          apiClient.clearAuth()
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        }
      } else {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [user, router, pathname, fetchUser])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}
