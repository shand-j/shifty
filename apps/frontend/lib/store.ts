"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Tenant, Notification } from "./types"
import { getAPIClient } from "./api-client"

interface AppState {
  user: User | null
  tenant: Tenant | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  notifications: Notification[]
  loading: boolean
  setUser: (user: User | null) => void
  setTenant: (tenant: Tenant | null) => void
  setToken: (token: string | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setNotifications: (notifications: Notification[]) => void
  markNotificationRead: (id: string) => void
  logout: () => void
  loadNotifications: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      notifications: [],
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTenant: (tenant) => set({ tenant }),
      setToken: (token) => set({ token }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setNotifications: (notifications) => set({ notifications }),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      logout: () => {
        set({ user: null, tenant: null, token: null, isAuthenticated: false })
        // Clear API client token
        if (typeof window !== 'undefined') {
          import('./api-client').then(({ apiClient }) => {
            apiClient.clearToken()
          })
        }
      },
      loadNotifications: async () => {
        try {
          const { apiClient } = await import('./api-client')
          const notifications = await apiClient.getNotifications()
          set({ notifications })
        } catch (error) {
          console.error('Failed to load notifications:', error)
        }
      }
    }),
    {
      name: "shifty-app-storage",
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
