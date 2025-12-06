"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Users, TrendingUp, TrendingDown, AlertTriangle, Clock, Zap } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts"

// Mock adoption data
const overallAdoption = 78
const weeklyActiveUsers = 52
const totalUsers = 67
const avgSessionsPerUser = 4.2

const featureAdoption = [
  { feature: "Test Explorer", adoptionRate: 94, activeUsers: 63, trend: 5 },
  { feature: "Selector Healing", adoptionRate: 87, activeUsers: 58, trend: 12 },
  { feature: "Pipeline Integration", adoptionRate: 82, activeUsers: 55, trend: 8 },
  { feature: "Manual Sessions", adoptionRate: 71, activeUsers: 48, trend: 3 },
  { feature: "HITL Arcade", adoptionRate: 64, activeUsers: 43, trend: 18 },
  { feature: "Knowledge Hub", adoptionRate: 52, activeUsers: 35, trend: 24 },
  { feature: "ROI Dashboard", adoptionRate: 48, activeUsers: 32, trend: 6 },
  { feature: "Agent PRs", adoptionRate: 41, activeUsers: 27, trend: 15 },
]

const teamAdoption = [
  { team: "Platform Core", score: 94, active: 12, total: 12 },
  { team: "Mobile Squad", score: 89, active: 7, total: 8 },
  { team: "API Team", score: 82, active: 8, total: 10 },
  { team: "Frontend Guild", score: 78, active: 7, total: 9 },
  { team: "Data Engineering", score: 71, active: 5, total: 7 },
  { team: "DevOps Team", score: 61, active: 4, total: 6 },
  { team: "Legacy Support", score: 52, active: 3, total: 6 },
  { team: "New Initiatives", score: 34, active: 2, total: 5 },
]

const onboardingFunnel = [
  { stage: "Account Created", count: 67, rate: 100 },
  { stage: "First Login", count: 65, rate: 97 },
  { stage: "Completed Tutorial", count: 58, rate: 87 },
  { stage: "First Test Run", count: 52, rate: 78 },
  { stage: "Pipeline Connected", count: 45, rate: 67 },
  { stage: "First Healing", count: 38, rate: 57 },
  { stage: "Weekly Active", count: 52, rate: 78 },
]

const engagementTrends = [
  { date: "W1", dau: 32, wau: 45, sessions: 120 },
  { date: "W2", dau: 35, wau: 48, sessions: 145 },
  { date: "W3", dau: 38, wau: 50, sessions: 168 },
  { date: "W4", dau: 42, wau: 52, sessions: 195 },
  { date: "W5", dau: 45, wau: 54, sessions: 218 },
  { date: "W6", dau: 48, wau: 52, sessions: 234 },
]

const churnRisk = [
  {
    user: "Pat Martinez",
    team: "Legacy Support",
    lastActive: "14 days ago",
    risk: "high",
    reasons: ["No sessions in 2 weeks", "Tutorial incomplete"],
  },
  {
    user: "Chris Johnson",
    team: "New Initiatives",
    lastActive: "10 days ago",
    risk: "high",
    reasons: ["No tests run", "Pipeline not connected"],
  },
  {
    user: "Dana Lee",
    team: "DevOps Team",
    lastActive: "7 days ago",
    risk: "medium",
    reasons: ["Declining engagement", "Limited feature usage"],
  },
]

export function AdoptionDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Adoption Analytics</h1>
        <p className="text-muted-foreground">Track platform adoption and user engagement across your organization</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Overall Adoption</span>
            </div>
            <p className="text-3xl font-bold text-card-foreground">{overallAdoption}%</p>
            <Progress value={overallAdoption} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Weekly Active</span>
            </div>
            <p className="text-3xl font-bold text-card-foreground">
              {weeklyActiveUsers}
              <span className="text-lg text-muted-foreground">/{totalUsers}</span>
            </p>
            <p className="text-xs text-green-500 mt-1">+8% from last week</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Avg Sessions/User</span>
            </div>
            <p className="text-3xl font-bold text-card-foreground">{avgSessionsPerUser}</p>
            <p className="text-xs text-green-500 mt-1">+0.6 from last week</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">Churn Risk</span>
            </div>
            <p className="text-3xl font-bold text-red-500">{churnRisk.length}</p>
            <p className="text-xs text-muted-foreground mt-1">users at risk</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="churn">Churn Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Trends */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Engagement Trends</CardTitle>
                <CardDescription>Weekly active users and sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="wau"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        name="Weekly Active"
                      />
                      <Line
                        type="monotone"
                        dataKey="dau"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        name="Daily Active"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Features */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Feature Adoption</CardTitle>
                <CardDescription>Most used platform features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featureAdoption.slice(0, 5).map((feature) => (
                    <div key={feature.feature} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-card-foreground">{feature.feature}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-card-foreground">{feature.adoptionRate}%</span>
                          {feature.trend > 10 ? (
                            <Badge variant="default" className="text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {feature.trend}%
                            </Badge>
                          ) : feature.trend > 0 ? (
                            <span className="text-xs text-green-500">+{feature.trend}%</span>
                          ) : null}
                        </div>
                      </div>
                      <Progress value={feature.adoptionRate} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6 mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Feature Adoption Breakdown</CardTitle>
              <CardDescription>Detailed adoption metrics for each platform feature</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureAdoption.map((feature) => (
                  <div key={feature.feature} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-card-foreground">{feature.feature}</p>
                        <p className="text-sm text-muted-foreground">
                          {feature.activeUsers} of {totalUsers} users
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-card-foreground">{feature.adoptionRate}%</p>
                        <div className="flex items-center gap-1 justify-end">
                          {feature.trend > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={feature.trend > 0 ? "text-green-500" : "text-red-500"}>
                            {feature.trend > 0 ? "+" : ""}
                            {feature.trend}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Progress value={feature.adoptionRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6 mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Team Adoption Scores</CardTitle>
              <CardDescription>Compare adoption across teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamAdoption} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="team" type="category" width={120} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {teamAdoption.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.score >= 80
                              ? "hsl(var(--primary))"
                              : entry.score >= 60
                                ? "hsl(var(--chart-2))"
                                : "hsl(var(--destructive))"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-6 mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Onboarding Funnel</CardTitle>
              <CardDescription>User progression through onboarding stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {onboardingFunnel.map((stage, idx) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-card-foreground">{stage.stage}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-card-foreground">{stage.count}</span>
                            <span className="text-sm text-muted-foreground">({stage.rate}%)</span>
                          </div>
                        </div>
                        <Progress value={stage.rate} className="h-2" />
                      </div>
                    </div>
                    {idx < onboardingFunnel.length - 1 && <div className="absolute left-5 top-12 h-4 w-px bg-border" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn" className="space-y-6 mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Users at Churn Risk
              </CardTitle>
              <CardDescription>Users who may need intervention to prevent disengagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churnRisk.map((user) => (
                  <div
                    key={user.user}
                    className={`p-4 rounded-lg border ${
                      user.risk === "high" ? "border-red-500/50 bg-red-500/5" : "border-amber-500/50 bg-amber-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-card-foreground">{user.user}</p>
                        <p className="text-sm text-muted-foreground">{user.team}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={user.risk === "high" ? "destructive" : "secondary"} className="capitalize">
                          {user.risk} risk
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {user.lastActive}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {user.reasons.map((reason, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                          {reason}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
