"use client"

import { useAppStore } from "@/lib/store"
import { QADashboard } from "./personas/qa-dashboard"
import { DevDashboard } from "./personas/dev-dashboard"
import { ManagerDashboard } from "./personas/manager-dashboard"
import { PODashboard } from "./personas/po-dashboard"
import { DesignerDashboard } from "./personas/designer-dashboard"
import { GTMDashboard } from "./personas/gtm-dashboard"
import { PersonaSwitcher } from "./persona-switcher"

export function DashboardContent() {
  const { user } = useAppStore()
  const persona = user?.persona || "qa"

  const renderDashboard = () => {
    switch (persona) {
      case "qa":
        return <QADashboard />
      case "dev":
        return <DevDashboard />
      case "manager":
        return <ManagerDashboard />
      case "po":
        return <PODashboard />
      case "designer":
        return <DesignerDashboard />
      case "gtm":
        return <GTMDashboard />
      default:
        return <QADashboard />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {user?.name?.split(" ")[0]}</p>
        </div>
        <PersonaSwitcher />
      </div>
      {renderDashboard()}
    </div>
  )
}
