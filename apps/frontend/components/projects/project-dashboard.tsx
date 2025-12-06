"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, TestTube2, Bug, Clock, Info } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock project data with feature confidence
const projectData = {
  id: "p1",
  name: "Auth Service",
  team: "Platform Core",
  teamId: "1",
  qualityScore: 94,
  testCoverage: 87,
  riskLevel: "low",
  lastDeployment: "2h ago",
  features: [
    {
      id: "f1",
      name: "User Login",
      confidence: 96,
      testCount: 24,
      passingTests: 24,
      failingTests: 0,
      flakyTests: 0,
      lastTested: "1h ago",
      coverage: { unit: 92, integration: 88, e2e: 78 },
      riskFactors: [],
    },
    {
      id: "f2",
      name: "Password Reset",
      confidence: 89,
      testCount: 18,
      passingTests: 16,
      failingTests: 1,
      flakyTests: 1,
      lastTested: "3h ago",
      coverage: { unit: 85, integration: 72, e2e: 65 },
      riskFactors: ["1 flaky test affecting CI", "Integration coverage below threshold"],
    },
    {
      id: "f3",
      name: "OAuth Integration",
      confidence: 82,
      testCount: 15,
      passingTests: 12,
      failingTests: 2,
      flakyTests: 1,
      lastTested: "6h ago",
      coverage: { unit: 78, integration: 65, e2e: 58 },
      riskFactors: ["2 failing tests", "Low E2E coverage", "Recent code changes untested"],
    },
    {
      id: "f4",
      name: "Session Management",
      confidence: 91,
      testCount: 20,
      passingTests: 19,
      failingTests: 0,
      flakyTests: 1,
      lastTested: "2h ago",
      coverage: { unit: 88, integration: 82, e2e: 71 },
      riskFactors: ["1 flaky test"],
    },
    {
      id: "f5",
      name: "MFA/2FA",
      confidence: 68,
      testCount: 8,
      passingTests: 6,
      failingTests: 2,
      flakyTests: 0,
      lastTested: "1d ago",
      coverage: { unit: 62, integration: 45, e2e: 32 },
      riskFactors: ["Low overall coverage", "2 failing tests", "No recent test activity", "Critical feature with gaps"],
    },
    {
      id: "f6",
      name: "API Key Management",
      confidence: 94,
      testCount: 16,
      passingTests: 16,
      failingTests: 0,
      flakyTests: 0,
      lastTested: "4h ago",
      coverage: { unit: 90, integration: 85, e2e: 72 },
      riskFactors: [],
    },
  ],
  testPyramid: {
    unit: { count: 245, coverage: 87, passing: 240 },
    integration: { count: 89, coverage: 72, passing: 84 },
    e2e: { count: 34, coverage: 58, passing: 31 },
  },
}

export function ProjectDashboard({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  const project = projectData

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-500"
    if (confidence >= 70) return "text-amber-500"
    return "text-red-500"
  }

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500/10 border-green-500/30"
    if (confidence >= 70) return "bg-amber-500/10 border-amber-500/30"
    return "bg-red-500/10 border-red-500/30"
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/teams/${project.teamId}`}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <Badge
                variant={
                  project.riskLevel === "low" ? "outline" : project.riskLevel === "medium" ? "secondary" : "destructive"
                }
                className="capitalize"
              >
                {project.riskLevel} risk
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Team:{" "}
              <Link href={`/teams/${project.teamId}`} className="text-primary hover:underline">
                {project.team}
              </Link>
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-card-foreground">{project.qualityScore}%</p>
            <p className="text-xs text-muted-foreground">Quality Score</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-xs">Test Coverage</span>
              </div>
              <p className="text-2xl font-bold text-card-foreground">{project.testCoverage}%</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TestTube2 className="w-4 h-4" />
                <span className="text-xs">Total Tests</span>
              </div>
              <p className="text-2xl font-bold text-card-foreground">
                {project.testPyramid.unit.count + project.testPyramid.integration.count + project.testPyramid.e2e.count}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Features</span>
              </div>
              <p className="text-2xl font-bold text-card-foreground">{project.features.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Last Deploy</span>
              </div>
              <p className="text-2xl font-bold text-card-foreground">{project.lastDeployment}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Feature Confidence</TabsTrigger>
            <TabsTrigger value="pyramid">Test Pyramid</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feature Confidence Summary */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Feature Confidence Overview</CardTitle>
                  <CardDescription>Confidence levels across all features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.features
                      .sort((a, b) => a.confidence - b.confidence)
                      .map((feature) => (
                        <div
                          key={feature.id}
                          className={`p-3 rounded-lg border ${getConfidenceBg(feature.confidence)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-card-foreground">{feature.name}</span>
                              {feature.riskFactors.length > 0 && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="font-medium mb-1">Risk Factors:</p>
                                    <ul className="text-xs space-y-1">
                                      {feature.riskFactors.map((r, i) => (
                                        <li key={i}>• {r}</li>
                                      ))}
                                    </ul>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <span className={`text-lg font-bold ${getConfidenceColor(feature.confidence)}`}>
                              {feature.confidence}%
                            </span>
                          </div>
                          <Progress value={feature.confidence} className="h-1.5 mt-2" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Hotspots */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Risk Hotspots
                  </CardTitle>
                  <CardDescription>Features requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.features
                      .filter((f) => f.riskFactors.length > 0)
                      .sort((a, b) => a.confidence - b.confidence)
                      .map((feature) => (
                        <div key={feature.id} className="p-4 rounded-lg border border-border">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-card-foreground">{feature.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {feature.testCount} tests · {feature.failingTests} failing · {feature.flakyTests} flaky
                              </p>
                            </div>
                            <span className={`text-xl font-bold ${getConfidenceColor(feature.confidence)}`}>
                              {feature.confidence}%
                            </span>
                          </div>
                          <div className="space-y-1 mt-3">
                            {feature.riskFactors.map((risk, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-amber-600">
                                <Bug className="w-3 h-3" />
                                <span>{risk}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-2">Coverage Breakdown</p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-sm font-bold text-card-foreground">{feature.coverage.unit}%</p>
                                <p className="text-xs text-muted-foreground">Unit</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-card-foreground">
                                  {feature.coverage.integration}%
                                </p>
                                <p className="text-xs text-muted-foreground">Integration</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-card-foreground">{feature.coverage.e2e}%</p>
                                <p className="text-xs text-muted-foreground">E2E</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    {project.features.filter((f) => f.riskFactors.length > 0).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                        <p className="text-sm text-muted-foreground">No risk hotspots detected!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6 mt-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Feature Confidence Details</CardTitle>
                <CardDescription>Deep dive into confidence metrics for each feature</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.features.map((feature) => (
                    <div key={feature.id} className="p-4 rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-card-foreground">{feature.name}</h4>
                            {feature.riskFactors.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {feature.riskFactors.length} risks
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Last tested: {feature.lastTested}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-3xl font-bold ${getConfidenceColor(feature.confidence)}`}>
                            {feature.confidence}%
                          </p>
                          <p className="text-xs text-muted-foreground">Confidence</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-2 rounded-lg bg-muted/30">
                          <p className="text-lg font-bold text-card-foreground">{feature.testCount}</p>
                          <p className="text-xs text-muted-foreground">Total Tests</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-green-500/10">
                          <p className="text-lg font-bold text-green-500">{feature.passingTests}</p>
                          <p className="text-xs text-muted-foreground">Passing</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-red-500/10">
                          <p className="text-lg font-bold text-red-500">{feature.failingTests}</p>
                          <p className="text-xs text-muted-foreground">Failing</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-amber-500/10">
                          <p className="text-lg font-bold text-amber-500">{feature.flakyTests}</p>
                          <p className="text-xs text-muted-foreground">Flaky</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Coverage by Test Type</p>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Unit</span>
                              <span className="text-card-foreground">{feature.coverage.unit}%</span>
                            </div>
                            <Progress value={feature.coverage.unit} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Integration</span>
                              <span className="text-card-foreground">{feature.coverage.integration}%</span>
                            </div>
                            <Progress value={feature.coverage.integration} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">E2E</span>
                              <span className="text-card-foreground">{feature.coverage.e2e}%</span>
                            </div>
                            <Progress value={feature.coverage.e2e} className="h-1.5" />
                          </div>
                        </div>
                      </div>

                      {feature.riskFactors.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2">Risk Factors</p>
                          <div className="space-y-1">
                            {feature.riskFactors.map((risk, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-amber-600">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{risk}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pyramid" className="space-y-6 mt-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Test Pyramid</CardTitle>
                <CardDescription>Distribution of tests following the testing pyramid principles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center py-8">
                  {/* Visual Pyramid */}
                  <div className="relative w-full max-w-md">
                    {/* E2E - Top */}
                    <div className="mx-auto w-1/3 mb-1">
                      <div className="bg-primary/20 border-2 border-primary rounded-t-lg p-4 text-center">
                        <p className="text-2xl font-bold text-card-foreground">{project.testPyramid.e2e.count}</p>
                        <p className="text-sm text-muted-foreground">E2E Tests</p>
                        <p className="text-xs text-primary">{project.testPyramid.e2e.coverage}% coverage</p>
                      </div>
                    </div>
                    {/* Integration - Middle */}
                    <div className="mx-auto w-2/3 mb-1">
                      <div className="bg-chart-2/20 border-2 border-chart-2 p-4 text-center">
                        <p className="text-2xl font-bold text-card-foreground">
                          {project.testPyramid.integration.count}
                        </p>
                        <p className="text-sm text-muted-foreground">Integration Tests</p>
                        <p className="text-xs text-chart-2">{project.testPyramid.integration.coverage}% coverage</p>
                      </div>
                    </div>
                    {/* Unit - Bottom */}
                    <div className="w-full">
                      <div className="bg-green-500/20 border-2 border-green-500 rounded-b-lg p-4 text-center">
                        <p className="text-2xl font-bold text-card-foreground">{project.testPyramid.unit.count}</p>
                        <p className="text-sm text-muted-foreground">Unit Tests</p>
                        <p className="text-xs text-green-500">{project.testPyramid.unit.coverage}% coverage</p>
                      </div>
                    </div>
                  </div>

                  {/* Pyramid Health */}
                  <div className="mt-8 w-full max-w-md">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-primary" />
                        <span className="font-medium text-card-foreground">Pyramid Health</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your test distribution follows the pyramid pattern well. Unit tests form the foundation (
                        {Math.round(
                          (project.testPyramid.unit.count /
                            (project.testPyramid.unit.count +
                              project.testPyramid.integration.count +
                              project.testPyramid.e2e.count)) *
                            100,
                        )}
                        %), with integration tests in the middle (
                        {Math.round(
                          (project.testPyramid.integration.count /
                            (project.testPyramid.unit.count +
                              project.testPyramid.integration.count +
                              project.testPyramid.e2e.count)) *
                            100,
                        )}
                        %) and E2E tests at the top (
                        {Math.round(
                          (project.testPyramid.e2e.count /
                            (project.testPyramid.unit.count +
                              project.testPyramid.integration.count +
                              project.testPyramid.e2e.count)) *
                            100,
                        )}
                        %).
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
