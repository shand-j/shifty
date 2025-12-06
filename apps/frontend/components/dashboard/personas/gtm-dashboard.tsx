"use client"

import { StatCard } from "../widgets/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Bug, Flag, Rocket, ExternalLink, AlertTriangle, Pause } from "lucide-react"

const releases = [
  { id: "1", name: "v2.4.0 - Payment Overhaul", date: "Dec 15", confidence: 92 },
  { id: "2", name: "v2.5.0 - Mobile Apps", date: "Jan 8", confidence: 78 },
  { id: "3", name: "v2.6.0 - AI Features", date: "Jan 22", confidence: 64 },
]

const customerIssues = [
  { id: "1", title: "Checkout fails on Safari", product: "Web App", status: "investigating" },
  { id: "2", title: "Slow load times on mobile", product: "Mobile", status: "in-progress" },
]

const featureFlags = [
  { id: "1", name: "new-checkout-flow", status: "rolling-out", percentage: 45, errorRate: 0.2 },
  { id: "2", name: "ai-suggestions", status: "paused", percentage: 10, errorRate: 2.1 },
]

export function GTMDashboard() {
  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Next Release" value="Dec 15" icon={<Calendar className="w-4 h-4" />} />
        <StatCard
          title="Customer Issues"
          value={4}
          change={-20}
          changeLabel="vs last week"
          icon={<Bug className="w-4 h-4" />}
        />
        <StatCard title="Active Flags" value={8} icon={<Flag className="w-4 h-4" />} />
        <StatCard
          title="Release Confidence"
          value="92%"
          change={8}
          changeLabel="improvement"
          icon={<Rocket className="w-4 h-4" />}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Releases */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Releases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {releases.map((release) => (
                  <div key={release.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">{release.name}</p>
                      <p className="text-xs text-muted-foreground">{release.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-card-foreground">{release.confidence}%</p>
                        <p className="text-xs text-muted-foreground">confidence</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Request Demo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feature Flags */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Feature Flag Status</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View All
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureFlags.map((flag) => (
                  <div key={flag.id} className="space-y-2 p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-card-foreground">{flag.name}</span>
                        <Badge
                          variant="secondary"
                          className={
                            flag.status === "paused" ? "bg-chart-3/20 text-chart-3" : "bg-chart-1/20 text-chart-1"
                          }
                        >
                          {flag.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {flag.errorRate > 1 && (
                          <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {flag.errorRate}% errors
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pause className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={flag.percentage} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-12">{flag.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          {/* Customer Issues */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Customer Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customerIssues.map((issue) => (
                  <div key={issue.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                    <p className="text-sm font-medium text-card-foreground">{issue.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{issue.product}</span>
                      <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
                        {issue.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
