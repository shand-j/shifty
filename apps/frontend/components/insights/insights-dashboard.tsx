"use client"

import { useState } from "react"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  Bug,
  Zap,
  ArrowRight,
  Filter,
  Download,
  Calendar,
  ChevronRight,
  AlertTriangle,
  FileCode,
  Clock,
  GitBranch,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"

const doraMetrics = {
  deploymentFrequency: { value: "4.2/day", trend: "+15%", status: "elite" },
  leadTime: { value: "2.3 hrs", trend: "-22%", status: "elite" },
  changeFailureRate: { value: "3.1%", trend: "-1.2%", status: "elite" },
  mttr: { value: "18 min", trend: "-35%", status: "high" },
}

const coverageTrend = [
  { date: "Jan", line: 72, branch: 65, overall: 68 },
  { date: "Feb", line: 74, branch: 67, overall: 70 },
  { date: "Mar", line: 78, branch: 71, overall: 74 },
  { date: "Apr", line: 81, branch: 74, overall: 77 },
  { date: "May", line: 84, branch: 78, overall: 81 },
  { date: "Jun", line: 87, branch: 82, overall: 84 },
]

const testExecutionTrend = [
  { date: "Mon", passed: 245, failed: 12, flaky: 8 },
  { date: "Tue", passed: 251, failed: 8, flaky: 6 },
  { date: "Wed", passed: 248, failed: 15, flaky: 12 },
  { date: "Thu", passed: 256, failed: 5, flaky: 4 },
  { date: "Fri", passed: 260, failed: 3, flaky: 2 },
  { date: "Sat", passed: 258, failed: 4, flaky: 3 },
  { date: "Sun", passed: 262, failed: 2, flaky: 1 },
]

const flakyTests = [
  { name: "checkout.spec.ts", flakeRate: 23, runs: 156, lastFlake: "2h ago" },
  { name: "auth-flow.spec.ts", flakeRate: 18, runs: 89, lastFlake: "5h ago" },
  { name: "search.spec.ts", flakeRate: 12, runs: 234, lastFlake: "1d ago" },
  { name: "cart-update.spec.ts", flakeRate: 8, runs: 178, lastFlake: "2d ago" },
]

const riskHotspots = [
  {
    file: "src/checkout/payment.ts",
    risk: 92,
    changes: 45,
    failures: 12,
    riskFactors: [
      { type: "High Change Frequency", impact: "high", description: "45 changes in last 30 days" },
      { type: "Test Failures", impact: "high", description: "12 failures correlated with changes" },
      { type: "Low Coverage", impact: "medium", description: "Only 65% branch coverage" },
      { type: "Complex Dependencies", impact: "medium", description: "14 direct dependencies" },
    ],
    recentChanges: [
      { commit: "Add retry logic for payment API", author: "alex.kim", date: "2 days ago" },
      { commit: "Fix currency conversion bug", author: "sarah.chen", date: "4 days ago" },
    ],
  },
  {
    file: "src/auth/session.ts",
    risk: 78,
    changes: 32,
    failures: 8,
    riskFactors: [
      { type: "Security Critical", impact: "high", description: "Authentication logic" },
      { type: "Test Failures", impact: "medium", description: "8 failures in test suite" },
      { type: "Stale Tests", impact: "low", description: "Tests not updated in 2 weeks" },
    ],
    recentChanges: [{ commit: "Update session timeout logic", author: "mike.johnson", date: "1 week ago" }],
  },
  {
    file: "src/api/orders.ts",
    risk: 65,
    changes: 28,
    failures: 5,
    riskFactors: [
      { type: "API Surface", impact: "medium", description: "Public API endpoint" },
      { type: "Missing E2E", impact: "medium", description: "No E2E coverage for edge cases" },
    ],
    recentChanges: [{ commit: "Add bulk order endpoint", author: "jordan.lee", date: "3 days ago" }],
  },
  {
    file: "src/cart/inventory.ts",
    risk: 54,
    changes: 19,
    failures: 3,
    riskFactors: [
      { type: "Race Conditions", impact: "medium", description: "Concurrent update issues detected" },
      { type: "Flaky Tests", impact: "low", description: "2 flaky tests in suite" },
    ],
    recentChanges: [{ commit: "Optimize inventory lookup", author: "emma.wilson", date: "5 days ago" }],
  },
]

const testPyramidData = {
  unit: { count: 1245, target: 1500, percentage: 63 },
  integration: { count: 456, target: 400, percentage: 23 },
  e2e: { count: 178, target: 150, percentage: 9 },
  visual: { count: 89, target: 100, percentage: 5 },
}

export function InsightsDashboard() {
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedHotspot, setSelectedHotspot] = useState<(typeof riskHotspots)[0] | null>(null)

  const totalTests =
    testPyramidData.unit.count +
    testPyramidData.integration.count +
    testPyramidData.e2e.count +
    testPyramidData.visual.count

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Insights</h1>
            <p className="text-sm text-muted-foreground">Quality metrics, DORA performance, and risk analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button asChild>
              <Link href="/insights/roi">
                ROI Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* DORA Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Deployment Frequency</CardDescription>
              <div className="flex items-baseline justify-between">
                <CardTitle className="text-2xl">{doraMetrics.deploymentFrequency.value}</CardTitle>
                <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-0">
                  Elite
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                {doraMetrics.deploymentFrequency.trend} vs last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Lead Time for Changes</CardDescription>
              <div className="flex items-baseline justify-between">
                <CardTitle className="text-2xl">{doraMetrics.leadTime.value}</CardTitle>
                <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-0">
                  Elite
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-emerald-400">
                <TrendingDown className="w-4 h-4" />
                {doraMetrics.leadTime.trend} vs last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Change Failure Rate</CardDescription>
              <div className="flex items-baseline justify-between">
                <CardTitle className="text-2xl">{doraMetrics.changeFailureRate.value}</CardTitle>
                <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-0">
                  Elite
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-emerald-400">
                <TrendingDown className="w-4 h-4" />
                {doraMetrics.changeFailureRate.trend} vs last period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Mean Time to Recovery</CardDescription>
              <div className="flex items-baseline justify-between">
                <CardTitle className="text-2xl">{doraMetrics.mttr.value}</CardTitle>
                <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-0">
                  High
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-emerald-400">
                <TrendingDown className="w-4 h-4" />
                {doraMetrics.mttr.trend} vs last period
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="quality" className="space-y-4">
          <TabsList>
            <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
            <TabsTrigger value="flaky">Flaky Tests</TabsTrigger>
            <TabsTrigger value="risk">Risk Hotspots</TabsTrigger>
          </TabsList>

          <TabsContent value="quality" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Test Execution Trend</CardTitle>
                  <CardDescription>Daily test results over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={testExecutionTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="date" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #333",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="passed"
                          stackId="1"
                          stroke="#14b8a6"
                          fill="#14b8a6"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="flaky"
                          stackId="1"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="failed"
                          stackId="1"
                          stroke="#ef4444"
                          fill="#ef4444"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Test Pyramid</CardTitle>
                  <CardDescription>{totalTests.toLocaleString()} total tests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-1">
                    {/* Visual Pyramid */}
                    <div className="relative w-full flex flex-col items-center">
                      {/* Visual/Manual - Top (smallest) */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="h-10 bg-purple-500/80 rounded-t-lg flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-purple-500 transition-colors"
                            style={{ width: "30%" }}
                          >
                            Visual ({testPyramidData.visual.count})
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{testPyramidData.visual.percentage}% of total</p>
                          <p className="text-xs text-muted-foreground">Target: {testPyramidData.visual.target}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* E2E */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="h-10 bg-amber-500/80 flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-amber-500 transition-colors"
                            style={{ width: "50%" }}
                          >
                            E2E ({testPyramidData.e2e.count})
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{testPyramidData.e2e.percentage}% of total</p>
                          <p className="text-xs text-muted-foreground">Target: {testPyramidData.e2e.target}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Integration */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="h-10 bg-blue-500/80 flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-blue-500 transition-colors"
                            style={{ width: "70%" }}
                          >
                            Integration ({testPyramidData.integration.count})
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{testPyramidData.integration.percentage}% of total</p>
                          <p className="text-xs text-muted-foreground">Target: {testPyramidData.integration.target}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Unit - Bottom (largest) */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="h-10 bg-teal-500/80 rounded-b-lg flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-teal-500 transition-colors"
                            style={{ width: "90%" }}
                          >
                            Unit ({testPyramidData.unit.count})
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{testPyramidData.unit.percentage}% of total</p>
                          <p className="text-xs text-muted-foreground">Target: {testPyramidData.unit.target}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Legend */}
                    <div className="w-full pt-4 space-y-2">
                      {[
                        {
                          name: "Unit",
                          color: "#14b8a6",
                          count: testPyramidData.unit.count,
                          pct: testPyramidData.unit.percentage,
                        },
                        {
                          name: "Integration",
                          color: "#3b82f6",
                          count: testPyramidData.integration.count,
                          pct: testPyramidData.integration.percentage,
                        },
                        {
                          name: "E2E",
                          color: "#f59e0b",
                          count: testPyramidData.e2e.count,
                          pct: testPyramidData.e2e.percentage,
                        },
                        {
                          name: "Visual",
                          color: "#8b5cf6",
                          count: testPyramidData.visual.count,
                          pct: testPyramidData.visual.percentage,
                        },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-muted-foreground">{item.name}</span>
                          </div>
                          <span className="font-medium">{item.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Coverage Trend</CardTitle>
                <CardDescription>Line, branch, and overall coverage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={coverageTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} domain={[60, 100]} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#1a1a1a",
                          border: "1px solid #333",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="line"
                        stroke="#14b8a6"
                        strokeWidth={2}
                        dot={{ fill: "#14b8a6" }}
                        name="Line Coverage"
                      />
                      <Line
                        type="monotone"
                        dataKey="branch"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6" }}
                        name="Branch Coverage"
                      />
                      <Line
                        type="monotone"
                        dataKey="overall"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: "#8b5cf6" }}
                        name="Overall"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flaky" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Flaky Test Tracker</CardTitle>
                <CardDescription>Tests with inconsistent pass/fail results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {flakyTests.map((test) => (
                    <div key={test.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bug className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="font-medium text-sm">{test.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {test.runs} runs | Last flake: {test.lastFlake}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${test.flakeRate}%` }} />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{test.flakeRate}%</span>
                        <Button size="sm" variant="outline">
                          <Zap className="w-4 h-4 mr-1" />
                          Fix
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Hotspots</CardTitle>
                <CardDescription>
                  Files with high change frequency and failure correlation. Click for details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskHotspots.map((file) => (
                    <Dialog key={file.file}>
                      <DialogTrigger asChild>
                        <div
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                          onClick={() => setSelectedHotspot(file)}
                        >
                          <div className="flex items-center gap-3">
                            <FileCode className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-mono text-sm">{file.file}</p>
                              <p className="text-xs text-muted-foreground">
                                {file.changes} changes | {file.failures} failures
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${file.risk}%`,
                                        backgroundColor:
                                          file.risk > 80 ? "#ef4444" : file.risk > 60 ? "#f59e0b" : "#14b8a6",
                                      }}
                                    />
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={
                                      file.risk > 80
                                        ? "border-red-500 text-red-400"
                                        : file.risk > 60
                                          ? "border-amber-500 text-amber-400"
                                          : "border-emerald-500 text-emerald-400"
                                    }
                                  >
                                    {file.risk}% risk
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium mb-1">Risk Factors:</p>
                                <ul className="text-xs space-y-1">
                                  {file.riskFactors.slice(0, 3).map((factor, i) => (
                                    <li key={i}>• {factor.type}</li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="font-mono text-base">{file.file}</DialogTitle>
                          <DialogDescription>Detailed risk analysis and contributing factors</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          {/* Risk Score */}
                          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                              style={{
                                backgroundColor:
                                  file.risk > 80
                                    ? "rgba(239,68,68,0.2)"
                                    : file.risk > 60
                                      ? "rgba(245,158,11,0.2)"
                                      : "rgba(20,184,166,0.2)",
                                color: file.risk > 80 ? "#ef4444" : file.risk > 60 ? "#f59e0b" : "#14b8a6",
                              }}
                            >
                              {file.risk}
                            </div>
                            <div>
                              <p className="font-medium">Risk Score</p>
                              <p className="text-sm text-muted-foreground">
                                Based on {file.riskFactors.length} contributing factors
                              </p>
                            </div>
                          </div>

                          {/* Risk Factors */}
                          <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Risk Factors
                            </h4>
                            <div className="space-y-2">
                              {file.riskFactors.map((factor, i) => (
                                <div
                                  key={i}
                                  className={`flex items-center justify-between p-3 rounded-lg border ${
                                    factor.impact === "high"
                                      ? "bg-red-500/10 border-red-500/30"
                                      : factor.impact === "medium"
                                        ? "bg-amber-500/10 border-amber-500/30"
                                        : "bg-blue-500/10 border-blue-500/30"
                                  }`}
                                >
                                  <div>
                                    <p className="text-sm font-medium">{factor.type}</p>
                                    <p className="text-xs text-muted-foreground">{factor.description}</p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={
                                      factor.impact === "high"
                                        ? "border-red-500 text-red-400"
                                        : factor.impact === "medium"
                                          ? "border-amber-500 text-amber-400"
                                          : "border-blue-500 text-blue-400"
                                    }
                                  >
                                    {factor.impact}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Recent Changes */}
                          <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                              <GitBranch className="w-4 h-4" />
                              Recent Changes
                            </h4>
                            <div className="space-y-2">
                              {file.recentChanges.map((change, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                  <div>
                                    <p className="text-sm">{change.commit}</p>
                                    <p className="text-xs text-muted-foreground">{change.author}</p>
                                  </div>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {change.date}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button className="flex-1">View Test Coverage</Button>
                            <Button variant="outline" className="flex-1 bg-transparent">
                              Generate Tests
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
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
