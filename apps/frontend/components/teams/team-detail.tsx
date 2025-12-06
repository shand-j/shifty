"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  Star,
  Target,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Zap,
  Award,
  ArrowLeft,
  UserPlus,
} from "lucide-react"
import Link from "next/link"

// Mock data for a specific team
const teamData = {
  id: "1",
  name: "Platform Core",
  description: "Core platform infrastructure and shared services",
  lead: { id: "m1", name: "Alex Kim", avatar: "A" },
  maturityLevel: 4 as const,
  adoptionScore: 94,
  qualityScore: 91,
  xp: 28400,
  cultureScore: {
    shiftLeftMindset: 85,
    testOwnership: 82,
    collaborationCulture: 90,
    continuousImprovement: 78,
    automationFirst: 88,
    dataInformed: 76,
  },
  projects: [
    { id: "p1", name: "Auth Service", qualityScore: 94, coverage: 87, riskLevel: "low" },
    { id: "p2", name: "API Gateway", qualityScore: 89, coverage: 82, riskLevel: "low" },
    { id: "p3", name: "Config Service", qualityScore: 78, coverage: 71, riskLevel: "medium" },
    { id: "p4", name: "Event Bus", qualityScore: 85, coverage: 79, riskLevel: "low" },
  ],
  members: [
    {
      id: "m1",
      name: "Alex Kim",
      role: "lead",
      xp: 4850,
      level: 12,
      streak: 34,
      attentionFlags: [],
      testsWritten: 245,
      collaborationScore: 94,
    },
    {
      id: "m2",
      name: "Jordan Lee",
      role: "senior",
      xp: 3920,
      level: 10,
      streak: 21,
      attentionFlags: [],
      testsWritten: 189,
      collaborationScore: 88,
    },
    {
      id: "m3",
      name: "Casey Patel",
      role: "senior",
      xp: 3640,
      level: 9,
      streak: 18,
      attentionFlags: [],
      testsWritten: 167,
      collaborationScore: 91,
    },
    {
      id: "m4",
      name: "Morgan Chen",
      role: "mid",
      xp: 2450,
      level: 7,
      streak: 12,
      attentionFlags: [],
      testsWritten: 98,
      collaborationScore: 85,
    },
    {
      id: "m5",
      name: "Riley Santos",
      role: "mid",
      xp: 2180,
      level: 6,
      streak: 8,
      attentionFlags: [{ type: "skill_gap", severity: "low", reason: "E2E testing skills below team average" }],
      testsWritten: 76,
      collaborationScore: 78,
    },
    {
      id: "m6",
      name: "Sam Wilson",
      role: "junior",
      xp: 1240,
      level: 4,
      streak: 5,
      attentionFlags: [
        { type: "mentorship_opportunity", severity: "low", reason: "Strong progress, ready for mentorship" },
      ],
      testsWritten: 42,
      collaborationScore: 82,
    },
  ],
  recentActivity: [
    {
      type: "test_added",
      description: "Added 12 integration tests for Auth Service",
      user: "Alex Kim",
      time: "2h ago",
    },
    { type: "pr_merged", description: "Agent PR merged: Healed 3 selectors", user: "Shifty Agent", time: "4h ago" },
    {
      type: "session_completed",
      description: "Exploratory session on API Gateway",
      user: "Casey Patel",
      time: "1d ago",
    },
  ],
}

const maturityColors = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-teal-500",
  5: "bg-green-500",
}

const maturityLabels = {
  1: "Initial",
  2: "Managed",
  3: "Defined",
  4: "Quantified",
  5: "Optimizing",
}

export function TeamDetail({ teamId }: { teamId: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  const team = teamData // In real app, fetch by teamId

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/teams">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{team.name}</h1>
            <div
              className={`w-8 h-8 rounded-full ${maturityColors[team.maturityLevel]} flex items-center justify-center text-white font-bold`}
            >
              {team.maturityLevel}
            </div>
            <Badge variant="outline">{maturityLabels[team.maturityLevel]}</Badge>
          </div>
          <p className="text-muted-foreground">{team.description}</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Members</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{team.members.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Adoption</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{team.adoptionScore}%</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Quality Score</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{team.qualityScore}%</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs">Total XP</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{team.xp.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="culture">Culture</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Leaderboard */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Team Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {team.members
                    .sort((a, b) => b.xp - a.xp)
                    .slice(0, 5)
                    .map((member, index) => (
                      <Link
                        key={member.id}
                        href={`/teams/${teamId}/members/${member.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? "bg-amber-500 text-white"
                              : index === 1
                                ? "bg-gray-400 text-white"
                                : index === 2
                                  ? "bg-amber-700 text-white"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-card-foreground truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-card-foreground">{member.xp.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Level {member.level}</p>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Members Needing Attention */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Members Needing Attention
                </CardTitle>
                <CardDescription>Coaching and support opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {team.members
                    .filter((m) => m.attentionFlags.length > 0)
                    .map((member) => (
                      <Link
                        key={member.id}
                        href={`/teams/${teamId}/members/${member.id}`}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-card-foreground">{member.name}</p>
                          {member.attentionFlags.map((flag, idx) => (
                            <div key={idx} className="mt-1">
                              <Badge
                                variant={flag.severity === "high" ? "destructive" : "outline"}
                                className="text-xs capitalize"
                              >
                                {flag.type.replace("_", " ")}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">{flag.reason}</p>
                            </div>
                          ))}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    ))}
                  {team.members.filter((m) => m.attentionFlags.length > 0).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                      <p className="text-sm text-muted-foreground">All team members are thriving!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-card-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} · {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.members.map((member) => (
              <Link key={member.id} href={`/teams/${teamId}/members/${member.id}`}>
                <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="text-lg">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-card-foreground truncate">{member.name}</p>
                          {member.attentionFlags.length > 0 && (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Level</p>
                        <p className="text-lg font-bold text-card-foreground">{member.level}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">XP</p>
                        <p className="text-lg font-bold text-card-foreground">{member.xp.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tests Written</p>
                        <p className="text-lg font-bold text-card-foreground">{member.testsWritten}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Collaboration</p>
                        <p className="text-lg font-bold text-card-foreground">{member.collaborationScore}%</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-muted-foreground">{member.streak} day streak</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-medium text-card-foreground">{project.name}</p>
                        <Badge
                          variant={
                            project.riskLevel === "low"
                              ? "outline"
                              : project.riskLevel === "medium"
                                ? "secondary"
                                : "destructive"
                          }
                          className="mt-1 capitalize"
                        >
                          {project.riskLevel} risk
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-card-foreground">{project.qualityScore}%</p>
                        <p className="text-xs text-muted-foreground">Quality Score</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Coverage</span>
                        <span className="text-card-foreground">{project.coverage}%</span>
                      </div>
                      <Progress value={project.coverage} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="culture" className="space-y-6 mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Team Quality Culture</CardTitle>
              <CardDescription>How well the team embodies quality engineering principles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(team.cultureScore).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    shiftLeftMindset: "Shift-Left Mindset",
                    testOwnership: "Test Ownership",
                    collaborationCulture: "Collaboration",
                    continuousImprovement: "Continuous Improvement",
                    automationFirst: "Automation First",
                    dataInformed: "Data Informed",
                  }
                  return (
                    <div key={key} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-card-foreground">{labels[key]}</span>
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-card-foreground">{value}</span>
                        <span className="text-muted-foreground mb-1">/100</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
