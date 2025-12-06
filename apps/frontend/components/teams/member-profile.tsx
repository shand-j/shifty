"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BookOpen,
  MessageSquare,
  Award,
  Target,
  Clock,
  GitPullRequest,
  TestTube2,
  Bug,
} from "lucide-react"
import Link from "next/link"

// Mock member data
const memberData = {
  id: "m5",
  name: "Riley Santos",
  email: "riley.santos@acme.com",
  role: "mid",
  persona: "dev",
  joinedAt: "2023-06-15",
  xp: 2180,
  level: 6,
  streak: 8,
  badges: ["First Test", "Healer", "Bug Hunter", "Team Player"],
  stats: {
    testsWritten: 76,
    testsHealed: 12,
    sessionsCompleted: 8,
    hitlContributions: 45,
    prsReviewed: 34,
    bugsPrevented: 7,
    avgTestQuality: 78,
    collaborationScore: 78,
  },
  skills: [
    { skill: "Unit Testing", level: 82, trend: "improving" },
    { skill: "Integration Testing", level: 74, trend: "stable" },
    { skill: "E2E Testing", level: 58, trend: "improving" },
    { skill: "API Testing", level: 71, trend: "improving" },
    { skill: "Performance Testing", level: 45, trend: "stable" },
    { skill: "Test Design", level: 68, trend: "improving" },
  ],
  attentionFlags: [
    {
      type: "skill_gap",
      severity: "low",
      reason: "E2E testing skills below team average",
      recommendation: "Pair with Casey Patel on upcoming E2E test initiatives",
      detectedAt: "2024-01-10",
    },
  ],
  recentActivity: [
    { type: "test_added", description: "Added 3 unit tests for UserService", time: "2h ago" },
    { type: "hitl", description: "Completed labeling mission (95% accuracy)", time: "1d ago" },
    { type: "pr_review", description: "Reviewed Agent PR #142", time: "2d ago" },
    { type: "session", description: "Exploratory session on Auth module", time: "3d ago" },
  ],
  xpHistory: [
    { week: "W1", xp: 180 },
    { week: "W2", xp: 220 },
    { week: "W3", xp: 195 },
    { week: "W4", xp: 280 },
    { week: "W5", xp: 310 },
    { week: "W6", xp: 265 },
  ],
  recommendations: [
    {
      type: "training",
      title: "E2E Testing with Playwright",
      description: "Complete the Playwright fundamentals course to improve E2E skills",
      priority: "high",
    },
    {
      type: "pairing",
      title: "Pair with Casey Patel",
      description: "Shadow Casey on the API Gateway E2E test suite work",
      priority: "medium",
    },
    {
      type: "mission",
      title: "Complete Triage Missions",
      description: "Triage missions will help understand common failure patterns",
      priority: "low",
    },
  ],
}

export function MemberProfile({ teamId, memberId }: { teamId: string; memberId: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  const member = memberData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/teams/${teamId}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <Avatar className="w-16 h-16">
          <AvatarFallback className="text-2xl">{member.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{member.name}</h1>
            <Badge variant="outline" className="capitalize">
              {member.role}
            </Badge>
            {member.attentionFlags.length > 0 && (
              <Badge variant="secondary">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Needs attention
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{member.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button>
            <BookOpen className="w-4 h-4 mr-2" />
            1:1 Notes
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{member.level}</div>
            <p className="text-xs text-muted-foreground">Level</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-card-foreground">{member.xp.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-3xl font-bold text-card-foreground">{member.streak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-card-foreground">{member.stats.testsWritten}</div>
            <p className="text-xs text-muted-foreground">Tests Written</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-card-foreground">{member.stats.collaborationScore}%</div>
            <p className="text-xs text-muted-foreground">Collaboration</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-card-foreground">{member.badges.length}</div>
            <p className="text-xs text-muted-foreground">Badges</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attention Flags */}
            {member.attentionFlags.length > 0 && (
              <Card className="bg-card border-amber-500/50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Attention Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {member.attentionFlags.map((flag, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Badge variant="outline" className="mb-2 capitalize">
                          {flag.type.replace("_", " ")}
                        </Badge>
                        <p className="text-sm text-card-foreground mb-2">{flag.reason}</p>
                        <p className="text-sm text-primary font-medium">Recommendation: {flag.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contribution Stats */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Contribution Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <TestTube2 className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-lg font-bold text-card-foreground">{member.stats.testsWritten}</p>
                      <p className="text-xs text-muted-foreground">Tests Written</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Zap className="w-5 h-5 text-teal-500" />
                    <div>
                      <p className="text-lg font-bold text-card-foreground">{member.stats.testsHealed}</p>
                      <p className="text-xs text-muted-foreground">Tests Healed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Target className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-lg font-bold text-card-foreground">{member.stats.hitlContributions}</p>
                      <p className="text-xs text-muted-foreground">HITL Tasks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Bug className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-lg font-bold text-card-foreground">{member.stats.bugsPrevented}</p>
                      <p className="text-xs text-muted-foreground">Bugs Prevented</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Badges Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {member.badges.map((badge) => (
                    <Badge key={badge} variant="secondary" className="text-sm py-1 px-3">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {member.recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-card-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6 mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Skills Assessment</CardTitle>
              <CardDescription>Current skill levels and growth trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {member.skills.map((skill) => (
                  <div key={skill.skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-card-foreground">{skill.skill}</span>
                        {skill.trend === "improving" && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {skill.trend === "declining" && <TrendingDown className="w-4 h-4 text-red-500" />}
                      </div>
                      <span className="text-sm font-bold text-card-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development" className="space-y-6 mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Development Recommendations</CardTitle>
              <CardDescription>Personalized suggestions for skill growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {member.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      rec.priority === "high"
                        ? "border-primary bg-primary/5"
                        : rec.priority === "medium"
                          ? "border-amber-500/50 bg-amber-500/5"
                          : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {rec.type}
                        </Badge>
                        <Badge
                          variant={
                            rec.priority === "high" ? "default" : rec.priority === "medium" ? "secondary" : "outline"
                          }
                          className="capitalize"
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                    </div>
                    <h4 className="font-medium text-card-foreground mb-1">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6 mt-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Complete history of contributions and engagements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {member.recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      {activity.type === "test_added" && <TestTube2 className="w-5 h-5 text-primary" />}
                      {activity.type === "hitl" && <Target className="w-5 h-5 text-amber-500" />}
                      {activity.type === "pr_review" && <GitPullRequest className="w-5 h-5 text-teal-500" />}
                      {activity.type === "session" && <Clock className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
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
