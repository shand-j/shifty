"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  Users,
  TrendingUp,
  Award,
  Target,
  Zap,
  ChevronRight,
  Star,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import Link from "next/link"

// Mock org data
const orgStats = {
  totalTeams: 8,
  totalMembers: 67,
  avgMaturityLevel: 3.2,
  avgAdoptionScore: 78,
  totalXP: 124500,
  activeProjects: 23,
}

const maturityDistribution = [
  { level: 1, teams: 1, label: "Initial", color: "bg-red-500" },
  { level: 2, teams: 2, label: "Managed", color: "bg-orange-500" },
  { level: 3, teams: 3, label: "Defined", color: "bg-yellow-500" },
  { level: 4, teams: 2, label: "Quantified", color: "bg-teal-500" },
  { level: 5, teams: 0, label: "Optimizing", color: "bg-green-500" },
]

const topTeams = [
  { id: "1", name: "Platform Core", maturity: 4, adoption: 94, xp: 28400, trend: 12 },
  { id: "2", name: "Mobile Squad", maturity: 4, adoption: 89, xp: 24200, trend: 8 },
  { id: "3", name: "API Team", maturity: 3, adoption: 82, xp: 19800, trend: 15 },
  { id: "4", name: "Frontend Guild", maturity: 3, adoption: 78, xp: 18100, trend: -3 },
  { id: "5", name: "Data Engineering", maturity: 3, adoption: 71, xp: 15600, trend: 6 },
]

const needingAttention = [
  { id: "6", name: "New Initiatives", issue: "Low adoption (34%)", severity: "high" },
  { id: "7", name: "Legacy Support", issue: "Declining maturity", severity: "medium" },
  { id: "8", name: "DevOps Team", issue: "3 disengaged members", severity: "medium" },
]

const orgLeaderboard = [
  { rank: 1, name: "Alex Kim", team: "Platform Core", xp: 4850, level: 12, streak: 34 },
  { rank: 2, name: "Jordan Lee", team: "Mobile Squad", xp: 4420, level: 11, streak: 28 },
  { rank: 3, name: "Casey Patel", team: "API Team", xp: 4180, level: 11, streak: 21 },
  { rank: 4, name: "Morgan Chen", team: "Frontend Guild", xp: 3920, level: 10, streak: 19 },
  { rank: 5, name: "Riley Santos", team: "Platform Core", xp: 3780, level: 10, streak: 15 },
]

const cultureMetrics = {
  shiftLeftMindset: { score: 72, trend: 8 },
  testOwnership: { score: 68, trend: 5 },
  collaborationCulture: { score: 81, trend: 3 },
  continuousImprovement: { score: 74, trend: 12 },
  automationFirst: { score: 79, trend: 6 },
  dataInformed: { score: 65, trend: 9 },
}

export function OrganizationHub() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organization Overview</h1>
          <p className="text-muted-foreground">Quality engineering health across your organization</p>
        </div>
        <Button asChild>
          <Link href="/teams">
            <Users className="w-4 h-4 mr-2" />
            View All Teams
          </Link>
        </Button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-xs">Teams</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{orgStats.totalTeams}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Members</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{orgStats.totalMembers}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs">Avg Maturity</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{orgStats.avgMaturityLevel.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Adoption</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{orgStats.avgAdoptionScore}%</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Total XP</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{(orgStats.totalXP / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Projects</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{orgStats.activeProjects}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maturity">Maturity</TabsTrigger>
          <TabsTrigger value="culture">Culture</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Maturity Distribution */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Maturity Distribution</CardTitle>
                <CardDescription>Teams by maturity level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maturityDistribution.map((item) => (
                    <div key={item.level} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white text-sm font-bold`}
                      >
                        {item.level}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-card-foreground">{item.label}</span>
                          <span className="text-sm font-medium text-card-foreground">{item.teams} teams</span>
                        </div>
                        <Progress value={(item.teams / 8) * 100} className="h-1.5 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Teams */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Performing Teams</CardTitle>
                <CardDescription>By adoption and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topTeams.slice(0, 5).map((team, index) => (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">{team.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>L{team.maturity}</span>
                          <span>·</span>
                          <span>{team.adoption}% adoption</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {team.trend > 0 ? (
                          <ArrowUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-red-500" />
                        )}
                        <span className={team.trend > 0 ? "text-green-500" : "text-red-500"}>
                          {Math.abs(team.trend)}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Needing Attention */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Needing Attention
                </CardTitle>
                <CardDescription>Teams requiring intervention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {needingAttention.map((team) => (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${team.severity === "high" ? "bg-red-500" : "bg-amber-500"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground">{team.name}</p>
                        <p className="text-xs text-muted-foreground">{team.issue}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
                {needingAttention.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                    <p className="text-sm text-muted-foreground">All teams healthy!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maturity" className="space-y-6 mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Quality Engineering Maturity Model</CardTitle>
              <CardDescription>
                Assess and track your organization&apos;s quality engineering maturity across key dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                {maturityDistribution.map((level) => (
                  <div
                    key={level.level}
                    className={`p-4 rounded-lg border-2 ${
                      level.teams > 0 ? "border-primary bg-primary/5" : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full ${level.color} flex items-center justify-center text-white font-bold`}
                      >
                        {level.level}
                      </div>
                      <span className="font-medium text-card-foreground">{level.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">{level.teams}</p>
                    <p className="text-xs text-muted-foreground">teams</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-card-foreground">Maturity Dimensions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Test Strategy", score: 72, description: "Defined test pyramid, risk-based testing" },
                    { name: "Automation Coverage", score: 68, description: "CI/CD integration, self-healing tests" },
                    { name: "Shift-Left Practices", score: 81, description: "Early testing, dev ownership" },
                    { name: "Quality Metrics", score: 65, description: "DORA metrics, quality gates" },
                    { name: "Collaboration", score: 78, description: "Cross-functional, shared ownership" },
                    { name: "Continuous Improvement", score: 74, description: "Retrospectives, experimentation" },
                  ].map((dim) => (
                    <div key={dim.name} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-card-foreground">{dim.name}</span>
                        <span className="text-lg font-bold text-primary">{dim.score}%</span>
                      </div>
                      <Progress value={dim.score} className="h-2 mb-2" />
                      <p className="text-xs text-muted-foreground">{dim.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="culture" className="space-y-6 mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Quality Culture Assessment</CardTitle>
              <CardDescription>
                Measuring the organizational mindset and behaviors around quality engineering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(cultureMetrics).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    shiftLeftMindset: "Shift-Left Mindset",
                    testOwnership: "Test Ownership",
                    collaborationCulture: "Collaboration Culture",
                    continuousImprovement: "Continuous Improvement",
                    automationFirst: "Automation First",
                    dataInformed: "Data Informed",
                  }
                  return (
                    <div key={key} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-card-foreground">{labels[key]}</span>
                        <Badge variant={value.trend > 0 ? "default" : "destructive"} className="text-xs">
                          {value.trend > 0 ? "+" : ""}
                          {value.trend}%
                        </Badge>
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-card-foreground">{value.score}</span>
                        <span className="text-muted-foreground mb-1">/100</span>
                      </div>
                      <Progress value={value.score} className="h-2" />
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-medium text-card-foreground mb-2">Culture Improvement Recommendations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      Increase data-informed decision making by integrating quality metrics into sprint reviews
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Strengthen test ownership by implementing test code review requirements for all PRs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Host monthly quality engineering guild meetings to share best practices</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6 mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Organization Leaderboard
              </CardTitle>
              <CardDescription>Top contributors across all teams this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orgLeaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      entry.rank <= 3 ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1
                          ? "bg-amber-500 text-white"
                          : entry.rank === 2
                            ? "bg-gray-400 text-white"
                            : entry.rank === 3
                              ? "bg-amber-700 text-white"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {entry.rank}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                      {entry.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-card-foreground">{entry.name}</p>
                      <p className="text-sm text-muted-foreground">{entry.team}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-card-foreground">{entry.xp.toLocaleString()} XP</p>
                      <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-muted-foreground">{entry.streak} day streak</span>
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
