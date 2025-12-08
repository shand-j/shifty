"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Tenant, Notification } from "./types"
import { getAPIClient } from "./api-client"

interface AppState {
  user: User | null
  tenant: Tenant | null
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  notifications: Notification[]
  loading: boolean
  setUser: (user: User | null) => void
  setTenant: (tenant: Tenant | null) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setNotifications: (notifications: Notification[]) => void
  markNotificationRead: (id: string) => void
  fetchUser: () => Promise<void>
  fetchNotifications: () => Promise<void>
  logout: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      notifications: [],
      loading: false,
      
      setUser: (user) => set({ user }),
      setTenant: (tenant) => set({ tenant }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setNotifications: (notifications) => set({ notifications }),
      
      markNotificationRead: async (id) => {
        try {
          const apiClient = getAPIClient()
          await apiClient.markNotificationRead(id)
          set((state) => ({
            notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
          }))
        } catch (error) {
          console.error('Failed to mark notification as read:', error)
        }
      },
      
      fetchUser: async () => {
        try {
          set({ loading: true })
          const apiClient = getAPIClient()
          
          if (!apiClient.isAuthenticated()) {
            set({ user: null, tenant: null, loading: false })
            return
          }
          
          const userResponse = await apiClient.getCurrentUser()
          if (userResponse.success && userResponse.data) {
            set({ user: userResponse.data })
            
            // Fetch tenant info
            try {
              const tenantsResponse = await apiClient.getTenants()
              if (tenantsResponse.success && tenantsResponse.data?.length > 0) {
                set({ tenant: tenantsResponse.data[0] })
              }
            } catch (error) {
              console.error('Failed to fetch tenant:', error)
            }
          }
        } catch (error) {
          console.error('Failed to fetch user:', error)
          set({ user: null, tenant: null })
        } finally {
          set({ loading: false })
        }
      },
      
      fetchNotifications: async () => {
        try {
          const apiClient = getAPIClient()
          const response = await apiClient.getNotifications()
          if (response.success && response.data) {
            set({ notifications: response.data })
          }
        } catch (error) {
          console.error('Failed to fetch notifications:', error)
        }
      },
      
      logout: async () => {
        try {
          const apiClient = getAPIClient()
          await apiClient.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({ user: null, tenant: null, notifications: [] })
        }
      },
    }),
    {
      name: "shifty-app-storage",
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
