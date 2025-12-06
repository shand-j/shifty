"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopBar } from "./top-bar"
import { Sidebar } from "./sidebar"
import { Breadcrumb } from "./breadcrumb"
import { CommandPalette } from "./command-palette"
import { useAppStore } from "@/lib/store"

interface AppShellProps {
  children: React.ReactNode
  showBreadcrumb?: boolean
}

export function AppShell({ children, showBreadcrumb = true }: AppShellProps) {
  const { user } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  // Don't render shell if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto h-[calc(100vh-3.5rem)]">
          {showBreadcrumb && <Breadcrumb />}
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
