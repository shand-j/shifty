"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
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
  Plus,
  Play,
  Eye,
  Archive,
  Trash2,
  MoreHorizontal,
  Clock,
  CheckCircle,
  FileText,
  Accessibility,
  Gauge,
  Download,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Session {
  id: string
  name: string
  type: "scripted" | "exploratory" | "accessibility" | "performance"
  status: "draft" | "active" | "completed" | "archived"
  owner: { name: string; avatar?: string }
  progress: number
  totalSteps: number
  createdAt: string
  duration?: string
}

const sessions: Session[] = [
  {
    id: "s1",
    name: "Checkout Flow Regression",
    type: "scripted",
    status: "active",
    owner: { name: "Sarah Chen" },
    progress: 8,
    totalSteps: 12,
    createdAt: "2 hours ago",
    duration: "45 min",
  },
  {
    id: "s2",
    name: "Mobile Navigation Exploration",
    type: "exploratory",
    status: "active",
    owner: { name: "Alex Kim" },
    progress: 0,
    totalSteps: 0,
    createdAt: "1 hour ago",
    duration: "32 min",
  },
  {
    id: "s3",
    name: "Login Accessibility Audit",
    type: "accessibility",
    status: "completed",
    owner: { name: "Jordan Lee" },
    progress: 15,
    totalSteps: 15,
    createdAt: "1 day ago",
    duration: "1h 12m",
  },
  {
    id: "s4",
    name: "Dashboard Load Performance",
    type: "performance",
    status: "completed",
    owner: { name: "Casey Patel" },
    progress: 8,
    totalSteps: 8,
    createdAt: "2 days ago",
    duration: "28 min",
  },
  {
    id: "s5",
    name: "User Settings Testing",
    type: "scripted",
    status: "draft",
    owner: { name: "Morgan Davis" },
    progress: 0,
    totalSteps: 10,
    createdAt: "3 days ago",
  },
  {
    id: "s6",
    name: "Search Feature Deep Dive",
    type: "exploratory",
    status: "archived",
    owner: { name: "Taylor Smith" },
    progress: 0,
    totalSteps: 0,
    createdAt: "1 week ago",
    duration: "2h 5m",
  },
]

const typeConfig = {
  scripted: { icon: FileText, color: "bg-chart-2/20 text-chart-2" },
  exploratory: { icon: Eye, color: "bg-chart-3/20 text-chart-3" },
  accessibility: { icon: Accessibility, color: "bg-chart-4/20 text-chart-4" },
  performance: { icon: Gauge, color: "bg-chart-1/20 text-chart-1" },
}

const statusConfig = {
  draft: { color: "bg-muted text-muted-foreground", label: "Draft" },
  active: { color: "bg-chart-1/20 text-chart-1", label: "Active" },
  completed: { color: "bg-chart-2/20 text-chart-2", label: "Completed" },
  archived: { color: "bg-muted text-muted-foreground", label: "Archived" },
}

export function SessionList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<Session["type"] | "all">("all")
  const [filterStatus, setFilterStatus] = useState<Session["status"] | "all">("all")

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || session.type === filterType
    const matchesStatus = filterStatus === "all" || session.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const activeCount = sessions.filter((s) => s.status === "active").length
  const completedCount = sessions.filter((s) => s.status === "completed").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Sessions</h1>
          <p className="text-muted-foreground text-sm">
            {activeCount} active • {completedCount} completed
          </p>
        </div>
        <Link href="/sessions/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Session
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-1/20 flex items-center justify-center">
                <Play className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
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
                <p className="text-2xl font-bold text-foreground">4.2h</p>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground">Bugs Found</p>
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
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-transparent"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="w-4 h-4" />
              Type: {filterType === "all" ? "All" : filterType}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterType("all")}>All Types</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("scripted")}>Scripted</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("exploratory")}>Exploratory</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("accessibility")}>Accessibility</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("performance")}>Performance</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              Status: {filterStatus === "all" ? "All" : filterStatus}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Status</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("draft")}>Draft</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("active")}>Active</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("completed")}>Completed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("archived")}>Archived</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Session List */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">All Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const TypeIcon = typeConfig[session.type].icon
              return (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        typeConfig[session.type].color,
                      )}
                    >
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/sessions/${session.id}`} className="font-medium text-foreground hover:underline">
                          {session.name}
                        </Link>
                        <Badge variant="secondary" className={statusConfig[session.status].color}>
                          {statusConfig[session.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="w-4 h-4">
                            <AvatarImage src={session.owner.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{session.owner.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{session.owner.name}</span>
                        </div>
                        <span>•</span>
                        <span>{session.createdAt}</span>
                        {session.duration && (
                          <>
                            <span>•</span>
                            <span>{session.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {session.type === "scripted" && session.totalSteps > 0 && (
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>
                            {session.progress}/{session.totalSteps}
                          </span>
                        </div>
                        <Progress value={(session.progress / session.totalSteps) * 100} className="h-1.5" />
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {session.status === "active" && (
                        <Link href={`/sessions/${session.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Play className="w-4 h-4" />
                            Resume
                          </Button>
                        </Link>
                      )}
                      {session.status === "draft" && (
                        <Link href={`/sessions/${session.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Play className="w-4 h-4" />
                            Start
                          </Button>
                        </Link>
                      )}
                      {session.status === "completed" && (
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                      )}
                      <Link href={`/sessions/${session.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
