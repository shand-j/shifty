"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  GitBranch,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  RotateCcw,
  StopCircle,
  Settings,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Pipeline {
  id: string
  repo: string
  branch: string
  status: "running" | "passed" | "failed" | "cancelled"
  duration: string
  testsTotal: number
  testsPassed: number
  testsFailed: number
  testsSkipped: number
  healsCount: number
  triggeredAt: string
  commit: string
  author: string
}

const pipelines: Pipeline[] = [
  {
    id: "p1",
    repo: "acme/web-app",
    branch: "main",
    status: "passed",
    duration: "4m 32s",
    testsTotal: 142,
    testsPassed: 142,
    testsFailed: 0,
    testsSkipped: 0,
    healsCount: 0,
    triggeredAt: "5 min ago",
    commit: "feat: add checkout flow",
    author: "Sarah Chen",
  },
  {
    id: "p2",
    repo: "acme/web-app",
    branch: "feature/payments",
    status: "failed",
    duration: "2m 18s",
    testsTotal: 142,
    testsPassed: 138,
    testsFailed: 3,
    testsSkipped: 1,
    healsCount: 2,
    triggeredAt: "15 min ago",
    commit: "fix: payment validation",
    author: "Alex Kim",
  },
  {
    id: "p3",
    repo: "acme/api",
    branch: "main",
    status: "running",
    duration: "1m 45s",
    testsTotal: 86,
    testsPassed: 54,
    testsFailed: 0,
    testsSkipped: 0,
    healsCount: 0,
    triggeredAt: "2 min ago",
    commit: "chore: update dependencies",
    author: "Jordan Lee",
  },
  {
    id: "p4",
    repo: "acme/mobile",
    branch: "develop",
    status: "passed",
    duration: "6m 12s",
    testsTotal: 98,
    testsPassed: 98,
    testsFailed: 0,
    testsSkipped: 0,
    healsCount: 1,
    triggeredAt: "1 hour ago",
    commit: "feat: add push notifications",
    author: "Casey Patel",
  },
  {
    id: "p5",
    repo: "acme/web-app",
    branch: "hotfix/login",
    status: "cancelled",
    duration: "0m 45s",
    testsTotal: 142,
    testsPassed: 12,
    testsFailed: 0,
    testsSkipped: 130,
    healsCount: 0,
    triggeredAt: "2 hours ago",
    commit: "hotfix: login redirect",
    author: "Morgan Davis",
  },
]

const statusConfig = {
  running: { icon: Loader2, color: "bg-chart-2/20 text-chart-2", label: "Running", iconClass: "animate-spin" },
  passed: { icon: CheckCircle, color: "bg-chart-1/20 text-chart-1", label: "Passed", iconClass: "" },
  failed: { icon: XCircle, color: "bg-destructive/20 text-destructive", label: "Failed", iconClass: "" },
  cancelled: { icon: StopCircle, color: "bg-muted text-muted-foreground", label: "Cancelled", iconClass: "" },
}

export function PipelineList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<Pipeline["status"] | "all">("all")

  const filteredPipelines = pipelines.filter((pipeline) => {
    const matchesSearch =
      pipeline.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pipeline.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pipeline.commit.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || pipeline.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const runningCount = pipelines.filter((p) => p.status === "running").length
  const passedCount = pipelines.filter((p) => p.status === "passed").length
  const failedCount = pipelines.filter((p) => p.status === "failed").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pipelines</h1>
          <p className="text-muted-foreground text-sm">
            {runningCount} running • {passedCount} passed • {failedCount} failed
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Settings className="w-4 h-4" />
          Configure
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-chart-2 animate-spin" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{runningCount}</p>
                <p className="text-sm text-muted-foreground">Running</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-1/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">94%</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-3/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3m 42s</p>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">Auto-healed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by repo, branch, or commit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-transparent"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="w-4 h-4" />
              {filterStatus === "all" ? "All Status" : statusConfig[filterStatus].label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterStatus("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("running")}>Running</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("passed")}>Passed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("failed")}>Failed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>Cancelled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Pipeline List */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent Pipelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPipelines.map((pipeline) => {
              const StatusIcon = statusConfig[pipeline.status].icon
              return (
                <div key={pipeline.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        statusConfig[pipeline.status].color,
                      )}
                    >
                      <StatusIcon className={cn("w-5 h-5", statusConfig[pipeline.status].iconClass)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/pipelines/${pipeline.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {pipeline.repo}
                        </Link>
                        <Badge variant="secondary" className="bg-muted text-muted-foreground gap-1">
                          <GitBranch className="w-3 h-3" />
                          {pipeline.branch}
                        </Badge>
                        <Badge variant="secondary" className={statusConfig[pipeline.status].color}>
                          {statusConfig[pipeline.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate max-w-md">{pipeline.commit}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{pipeline.author}</span>
                        <span>•</span>
                        <span>{pipeline.triggeredAt}</span>
                        <span>•</span>
                        <span>{pipeline.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-chart-1">{pipeline.testsPassed}</span>
                        <span className="text-muted-foreground">/</span>
                        {pipeline.testsFailed > 0 && (
                          <>
                            <span className="text-sm font-medium text-destructive">{pipeline.testsFailed}</span>
                            <span className="text-muted-foreground">/</span>
                          </>
                        )}
                        <span className="text-sm text-muted-foreground">{pipeline.testsTotal}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">tests</p>
                    </div>
                    {pipeline.healsCount > 0 && (
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{pipeline.healsCount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">heals</p>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {pipeline.status === "running" ? (
                        <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:bg-destructive/20">
                          <StopCircle className="w-4 h-4" />
                          Cancel
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="gap-1">
                          <RotateCcw className="w-4 h-4" />
                          Re-run
                        </Button>
                      )}
                      <Link href={`/pipelines/${pipeline.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
