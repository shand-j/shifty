"use client"

import { useState } from "react"
import { StatCard } from "../widgets/stat-card"
import { QualityGauge } from "../widgets/quality-gauge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Flag,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Layers,
} from "lucide-react"

const features = [
  {
    id: "1",
    name: "Payment Integration",
    confidence: 94,
    trend: 3,
    testCoverage: 92,
    e2eCoverage: 88,
    lastRelease: "2 days ago",
    riskFactors: [],
    status: "healthy",
    stories: 12,
    storiesTested: 11,
  },
  {
    id: "2",
    name: "User Onboarding",
    confidence: 72,
    trend: -5,
    testCoverage: 78,
    e2eCoverage: 65,
    lastRelease: "1 week ago",
    riskFactors: ["Flaky signup flow test", "Missing mobile coverage"],
    status: "at-risk",
    stories: 8,
    storiesTested: 6,
  },
  {
    id: "3",
    name: "Search & Discovery",
    confidence: 88,
    trend: 8,
    testCoverage: 85,
    e2eCoverage: 82,
    lastRelease: "3 days ago",
    riskFactors: ["Performance test pending"],
    status: "warning",
    stories: 15,
    storiesTested: 14,
  },
  {
    id: "4",
    name: "Checkout Flow",
    confidence: 96,
    trend: 2,
    testCoverage: 95,
    e2eCoverage: 94,
    lastRelease: "1 day ago",
    riskFactors: [],
    status: "healthy",
    stories: 10,
    storiesTested: 10,
  },
  {
    id: "5",
    name: "User Profile",
    confidence: 65,
    trend: -12,
    testCoverage: 68,
    e2eCoverage: 45,
    lastRelease: "2 weeks ago",
    riskFactors: ["Major refactor in progress", "3 failing tests", "Missing integration tests"],
    status: "critical",
    stories: 6,
    storiesTested: 4,
  },
]

const featureSets = [
  {
    id: "1",
    name: "Core Commerce",
    features: ["Payment Integration", "Checkout Flow", "Cart Management"],
    overallConfidence: 93,
    blockers: 0,
    trend: 4,
  },
  {
    id: "2",
    name: "User Experience",
    features: ["User Onboarding", "User Profile", "Preferences"],
    overallConfidence: 68,
    blockers: 2,
    trend: -8,
  },
  {
    id: "3",
    name: "Discovery",
    features: ["Search & Discovery", "Recommendations", "Filters"],
    overallConfidence: 85,
    blockers: 1,
    trend: 5,
  },
]

const sessions = [
  { id: "1", name: "Checkout Flow Review", owner: "Alex Kim", status: "pending", priority: "high" },
  { id: "2", name: "Mobile Regression", owner: "Unassigned", status: "pending", priority: "medium" },
  { id: "3", name: "New Onboarding Flow", owner: "Sarah Chen", status: "in-progress", priority: "high" },
]

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return "text-emerald-400"
  if (confidence >= 75) return "text-amber-400"
  return "text-red-400"
}

const getConfidenceBg = (confidence: number) => {
  if (confidence >= 90) return "bg-emerald-500"
  if (confidence >= 75) return "bg-amber-500"
  return "bg-red-500"
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "healthy":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Healthy</Badge>
    case "warning":
      return <Badge className="bg-amber-500/20 text-amber-400 border-0">Warning</Badge>
    case "at-risk":
      return <Badge className="bg-orange-500/20 text-orange-400 border-0">At Risk</Badge>
    case "critical":
      return <Badge className="bg-red-500/20 text-red-400 border-0">Critical</Badge>
    default:
      return null
  }
}

export function PODashboard() {
  const [selectedFeature, setSelectedFeature] = useState<(typeof features)[0] | null>(null)

  const overallConfidence = Math.round(features.reduce((acc, f) => acc + f.confidence, 0) / features.length)
  const atRiskCount = features.filter((f) => f.status === "at-risk" || f.status === "critical").length

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Overall Confidence"
            value={`${overallConfidence}%`}
            change={5}
            changeLabel="vs last sprint"
            icon={<Shield className="w-4 h-4" />}
          />
          <StatCard
            title="Features At Risk"
            value={atRiskCount}
            change={atRiskCount > 0 ? -atRiskCount * 10 : 0}
            changeLabel="needs attention"
            icon={<AlertTriangle className="w-4 h-4" />}
          />
          <StatCard
            title="Pending Sessions"
            value={sessions.filter((s) => s.status === "pending").length}
            icon={<Calendar className="w-4 h-4" />}
          />
          <StatCard
            title="Story Coverage"
            value={`${Math.round((features.reduce((a, f) => a + f.storiesTested, 0) / features.reduce((a, f) => a + f.stories, 0)) * 100)}%`}
            change={8}
            changeLabel="vs last sprint"
            icon={<Target className="w-4 h-4" />}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="features" className="space-y-4">
              <TabsList>
                <TabsTrigger value="features">Feature Confidence</TabsTrigger>
                <TabsTrigger value="sets">Feature Sets</TabsTrigger>
              </TabsList>

              <TabsContent value="features" className="space-y-4">
                {/* Feature Confidence Cards */}
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Feature Confidence Overview
                    </CardTitle>
                    <CardDescription>Click on a feature to see detailed risk analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {features.map((feature) => (
                        <Dialog key={feature.id}>
                          <DialogTrigger asChild>
                            <div
                              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => setSelectedFeature(feature)}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="relative w-12 h-12">
                                  <svg className="w-12 h-12 transform -rotate-90">
                                    <circle
                                      cx="24"
                                      cy="24"
                                      r="20"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      className="text-muted"
                                    />
                                    <circle
                                      cx="24"
                                      cy="24"
                                      r="20"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      strokeDasharray={`${(feature.confidence / 100) * 125.6} 125.6`}
                                      className={getConfidenceColor(feature.confidence)}
                                    />
                                  </svg>
                                  <span
                                    className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${getConfidenceColor(feature.confidence)}`}
                                  >
                                    {feature.confidence}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-card-foreground">{feature.name}</p>
                                    {getStatusBadge(feature.status)}
                                  </div>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                    <span>
                                      {feature.storiesTested}/{feature.stories} stories tested
                                    </span>
                                    <span>Last release: {feature.lastRelease}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  {feature.trend > 0 ? (
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                  )}
                                  <span className={feature.trend > 0 ? "text-emerald-400" : "text-red-400"}>
                                    {feature.trend > 0 ? "+" : ""}
                                    {feature.trend}%
                                  </span>
                                </div>
                                {feature.riskFactors.length > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className="border-amber-500 text-amber-400">
                                        {feature.riskFactors.length} risks
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <ul className="text-xs space-y-1">
                                        {feature.riskFactors.map((risk, i) => (
                                          <li key={i}>• {risk}</li>
                                        ))}
                                      </ul>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {feature.name}
                                {getStatusBadge(feature.status)}
                              </DialogTitle>
                              <DialogDescription>Detailed confidence and risk analysis</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              {/* Confidence Breakdown */}
                              <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-muted/30 rounded-lg text-center">
                                  <p className="text-3xl font-bold text-primary">{feature.confidence}%</p>
                                  <p className="text-xs text-muted-foreground">Overall Confidence</p>
                                </div>
                                <div className="p-4 bg-muted/30 rounded-lg text-center">
                                  <p className="text-3xl font-bold">{feature.testCoverage}%</p>
                                  <p className="text-xs text-muted-foreground">Test Coverage</p>
                                </div>
                                <div className="p-4 bg-muted/30 rounded-lg text-center">
                                  <p className="text-3xl font-bold">{feature.e2eCoverage}%</p>
                                  <p className="text-xs text-muted-foreground">E2E Coverage</p>
                                </div>
                              </div>

                              {/* Story Progress */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Story Coverage</span>
                                  <span className="text-sm text-muted-foreground">
                                    {feature.storiesTested}/{feature.stories} stories
                                  </span>
                                </div>
                                <Progress value={(feature.storiesTested / feature.stories) * 100} className="h-2" />
                              </div>

                              {/* Risk Factors */}
                              {feature.riskFactors.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    Risk Factors
                                  </h4>
                                  <div className="space-y-2">
                                    {feature.riskFactors.map((risk, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                                      >
                                        <Flag className="w-4 h-4 text-amber-400" />
                                        <span className="text-sm">{risk}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-3">
                                <Button className="flex-1">View Test Suite</Button>
                                <Button variant="outline" className="flex-1 bg-transparent">
                                  Schedule Review
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sets" className="space-y-4">
                {/* Feature Sets Overview */}
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Feature Set Confidence</CardTitle>
                    <CardDescription>Aggregated confidence by product area</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {featureSets.map((set) => (
                        <div key={set.id} className="p-4 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{set.name}</h4>
                              <p className="text-xs text-muted-foreground">{set.features.join(", ")}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              {set.blockers > 0 && (
                                <Badge variant="outline" className="border-red-500 text-red-400">
                                  {set.blockers} blockers
                                </Badge>
                              )}
                              <div className="flex items-center gap-1">
                                {set.trend > 0 ? (
                                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-400" />
                                )}
                                <span className={set.trend > 0 ? "text-emerald-400" : "text-red-400"}>
                                  {set.trend > 0 ? "+" : ""}
                                  {set.trend}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${getConfidenceBg(set.overallConfidence)}`}
                                style={{ width: `${set.overallConfidence}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold ${getConfidenceColor(set.overallConfidence)}`}>
                              {set.overallConfidence}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Session Queue */}
            <Card className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Manual Session Queue</CardTitle>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  View All
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={
                            session.priority === "high"
                              ? "border-red-500 text-red-400"
                              : "border-amber-500 text-amber-400"
                          }
                        >
                          {session.priority}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{session.name}</p>
                          <p className="text-xs text-muted-foreground">{session.owner}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.status === "in-progress" ? (
                          <Badge className="bg-blue-500/20 text-blue-400 border-0">In Progress</Badge>
                        ) : (
                          <>
                            <Button variant="outline" size="sm">
                              Schedule
                            </Button>
                            <Button size="sm">Claim</Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <QualityGauge
              value={overallConfidence}
              label="Release Readiness"
              sublabel="Based on feature confidence scores"
            />

            {/* Release Checklist */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Release Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      label: "All critical features > 90%",
                      passed: features.filter((f) => f.status === "critical").length === 0,
                    },
                    {
                      label: "No blocking risks",
                      passed: features.filter((f) => f.riskFactors.length > 2).length === 0,
                    },
                    { label: "E2E coverage > 80%", passed: true },
                    { label: "All sessions completed", passed: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.passed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      )}
                      <span className={`text-sm ${item.passed ? "text-muted-foreground" : "text-foreground"}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
