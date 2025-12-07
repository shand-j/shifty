import { create } from "zustand"
import type { User, Tenant, Notification } from "./types"
import { apiClient } from "./api-client"

interface AppState {
  user: User | null
  tenant: Tenant | null
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  notifications: Notification[]
  isLoadingUser: boolean
  isLoadingTenant: boolean
  isLoadingNotifications: boolean
  setUser: (user: User | null) => void
  setTenant: (tenant: Tenant | null) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setNotifications: (notifications: Notification[]) => void
  markNotificationRead: (id: string) => void
  fetchUser: () => Promise<void>
  fetchTenant: () => Promise<void>
  fetchNotifications: () => Promise<void>
  logout: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  tenant: null,
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  notifications: [],
  isLoadingUser: false,
  isLoadingTenant: false,
  isLoadingNotifications: false,
  
  setUser: (user) => set({ user }),
  setTenant: (tenant) => set({ tenant }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setNotifications: (notifications) => set({ notifications }),
  
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  
  fetchUser: async () => {
    if (get().isLoadingUser) return
    
    set({ isLoadingUser: true })
    try {
      const user = await apiClient.getCurrentUser()
      set({ user, isLoadingUser: false })
    } catch (error) {
      console.error("Failed to fetch user:", error)
      set({ user: null, isLoadingUser: false })
    }
  },
  
  fetchTenant: async () => {
    if (get().isLoadingTenant) return
    
    set({ isLoadingTenant: true })
    try {
      const tenant = await apiClient.getCurrentTenant()
      set({ tenant, isLoadingTenant: false })
    } catch (error) {
      console.error("Failed to fetch tenant:", error)
      set({ isLoadingTenant: false })
    }
  },
  
  fetchNotifications: async () => {
    if (get().isLoadingNotifications) return
    
    set({ isLoadingNotifications: true })
    try {
      const notifications = await apiClient.getNotifications()
      set({ notifications, isLoadingNotifications: false })
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      set({ isLoadingNotifications: false })
    }
  },
  
  logout: async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      set({ user: null, tenant: null, notifications: [] })
    }
  },
}))
