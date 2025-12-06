"use client"

import { create } from "zustand"
import type { User, Tenant, Notification } from "./types"

interface AppState {
  user: User | null
  tenant: Tenant | null
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  notifications: Notification[]
  setUser: (user: User | null) => void
  setTenant: (tenant: Tenant | null) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setNotifications: (notifications: Notification[]) => void
  markNotificationRead: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  tenant: {
    id: "1",
    name: "Acme Corp",
    slug: "acme",
  },
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  notifications: [
    {
      id: "1",
      type: "ci_failure",
      title: "Pipeline Failed",
      message: "main branch build failed on acme/web-app",
      read: false,
      createdAt: new Date().toISOString(),
      link: "/pipelines/1",
    },
    {
      id: "2",
      type: "healing_required",
      title: "Selector Healing Required",
      message: "3 selectors need review (confidence < 70%)",
      read: false,
      createdAt: new Date().toISOString(),
      link: "/healing",
    },
    {
      id: "3",
      type: "roi_alert",
      title: "ROI Milestone",
      message: "You saved 120 hours this month!",
      read: true,
      createdAt: new Date().toISOString(),
      link: "/insights/roi",
    },
  ],
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
}))
