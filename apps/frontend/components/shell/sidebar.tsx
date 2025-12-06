"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  TestTube2,
  Sparkles,
  PlayCircle,
  GitBranch,
  BarChart3,
  Settings,
  Trophy,
  PanelLeftClose,
  PanelLeft,
  GitPullRequest,
  Brain,
  FileCode2,
  Users,
  Building2,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organization", label: "Organization", icon: Building2 },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/adoption", label: "Adoption", icon: Target },
  { href: "/tests", label: "Tests", icon: TestTube2 },
  { href: "/healing", label: "Healing", icon: Sparkles },
  { href: "/sessions", label: "Sessions", icon: PlayCircle },
  { href: "/pipelines", label: "Pipelines", icon: GitBranch },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/knowledge", label: "Knowledge", icon: Brain },
  { href: "/agent-prs", label: "Agent PRs", icon: GitPullRequest },
  { href: "/arcade", label: "Arcade", icon: Trophy },
  { href: "/api-docs", label: "API Docs", icon: FileCode2 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, user } = useAppStore()

  // Persona-aware ordering
  const getOrderedNav = () => {
    const persona = user?.persona
    const baseNav = [...navItems]

    if (persona === "qa") {
      // QA sees Sessions first
      const sessionsIdx = baseNav.findIndex((i) => i.href === "/sessions")
      const sessions = baseNav.splice(sessionsIdx, 1)[0]
      baseNav.splice(1, 0, sessions)
    } else if (persona === "dev") {
      // Dev sees Tests first (already in position)
    } else if (persona === "manager") {
      // Manager sees Insights first
      const insightsIdx = baseNav.findIndex((i) => i.href === "/insights")
      const insights = baseNav.splice(insightsIdx, 1)[0]
      baseNav.splice(1, 0, insights)
    }

    return baseNav
  }

  const orderedNav = getOrderedNav()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "h-[calc(100vh-3.5rem)] border-r border-border bg-sidebar flex flex-col transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-56",
        )}
      >
        <nav className="flex-1 p-3 space-y-1">
          {orderedNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            )

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.href}>{linkContent}</div>
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-center text-sidebar-foreground/70"
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <>
                <PanelLeftClose className="w-5 h-5 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
