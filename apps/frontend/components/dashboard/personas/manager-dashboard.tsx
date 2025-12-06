"use client"

import { StatCard } from "../widgets/stat-card"
import { MiniChart } from "../widgets/mini-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Clock, Shield, TrendingUp, Users, Award } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const roiData = [
  { name: "Jan", value: 12000 },
  { name: "Feb", value: 18000 },
  { name: "Mar", value: 24000 },
  { name: "Apr", value: 32000 },
]

const doraMetrics = [
  { name: "Deployment Frequency", value: 4.2, unit: "/day", target: 5, color: "bg-chart-1" },
  { name: "Lead Time", value: 2.1, unit: "days", target: 1, color: "bg-chart-2" },
  { name: "MTTR", value: 1.4, unit: "hours", target: 1, color: "bg-chart-3" },
  { name: "Change Failure Rate", value: 8, unit: "%", target: 5, color: "bg-chart-4" },
]

const teamLeaders = [
  { name: "Alex Kim", xp: 2450, avatar: "A" },
  { name: "Jordan Lee", xp: 2180, avatar: "J" },
  { name: "Casey Patel", xp: 1920, avatar: "C" },
]

export function ManagerDashboard() {
  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Time Saved"
          value="127 hrs"
          change={18}
          changeLabel="vs last month"
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          title="Cost Avoided"
          value="$32,400"
          change={24}
          changeLabel="vs last month"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          title="Incidents Prevented"
          value={14}
          change={40}
          changeLabel="vs last month"
          icon={<Shield className="w-4 h-4" />}
        />
        <StatCard
          title="Team Efficiency"
          value="94%"
          change={8}
          changeLabel="improvement"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* DORA Metrics */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">DORA Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {doraMetrics.map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{metric.name}</span>
                      <span className="text-lg font-bold text-card-foreground">
                        {metric.value}
                        {metric.unit}
                      </span>
                    </div>
                    <Progress value={(metric.value / (metric.target * 2)) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Target: {metric.target}
                      {metric.unit}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <MiniChart title="ROI Trend" data={roiData} color="#22c55e" valuePrefix="$" />
        </div>
        <div className="space-y-6">
          {/* Team Leaderboard */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="w-4 h-4" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamLeaders.map((leader, index) => (
                  <div key={leader.name} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {leader.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">{leader.name}</p>
                      <p className="text-xs text-muted-foreground">{leader.xp.toLocaleString()} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SPACE Health */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                SPACE Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Satisfaction", value: 82 },
                  { name: "Performance", value: 91 },
                  { name: "Activity", value: 78 },
                  { name: "Collaboration", value: 85 },
                  { name: "Efficiency", value: 88 },
                ].map((metric) => (
                  <div key={metric.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{metric.name}</span>
                      <span className="text-card-foreground">{metric.value}%</span>
                    </div>
                    <Progress value={metric.value} className="h-1.5" />
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
