"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Bug,
  Clock,
  GitBranch,
  SkipForward,
  TrendingUp,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TriageTaskProps {
  taskIndex: number
  onComplete: (correct: boolean) => void
  onSkip: () => void
}

const tasks = [
  {
    id: 1,
    testName: "Checkout flow - payment submission",
    failureRate: 23,
    lastRun: "2 hours ago",
    affectedBranches: ["main", "feature/payments"],
    errorMessage: "TimeoutError: Element not found within 5000ms",
    stackTrace: `at waitForSelector (node_modules/playwright/lib/frame.js:123)
at PaymentPage.submitPayment (tests/checkout.spec.ts:45)
at Test.run (tests/checkout.spec.ts:78)`,
    recentRuns: [
      { status: "pass", branch: "main", time: "2h ago" },
      { status: "fail", branch: "feature/payments", time: "3h ago" },
      { status: "pass", branch: "main", time: "5h ago" },
      { status: "fail", branch: "main", time: "6h ago" },
      { status: "pass", branch: "main", time: "8h ago" },
    ],
    correctCategory: "timing",
    categories: {
      timing: "Race condition or slow network causing intermittent timeouts",
      selector: "Element selector is fragile and breaks on certain conditions",
      environment: "Test environment instability (CI resources, external services)",
      bug: "Actual product bug that manifests intermittently",
    },
  },
  {
    id: 2,
    testName: "User profile - avatar upload",
    failureRate: 67,
    lastRun: "30 mins ago",
    affectedBranches: ["main", "feature/profile", "develop"],
    errorMessage: "AssertionError: Expected 'success' but received 'error'",
    stackTrace: `at expect (node_modules/@playwright/test/lib/expect.js:89)
at ProfilePage.uploadAvatar (tests/profile.spec.ts:34)
at Test.run (tests/profile.spec.ts:56)`,
    recentRuns: [
      { status: "fail", branch: "main", time: "30m ago" },
      { status: "fail", branch: "develop", time: "1h ago" },
      { status: "fail", branch: "feature/profile", time: "2h ago" },
      { status: "pass", branch: "main", time: "4h ago" },
      { status: "fail", branch: "main", time: "5h ago" },
    ],
    correctCategory: "bug",
    categories: {
      timing: "Race condition or slow network causing intermittent timeouts",
      selector: "Element selector is fragile and breaks on certain conditions",
      environment: "Test environment instability (CI resources, external services)",
      bug: "Actual product bug that manifests intermittently",
    },
  },
  {
    id: 3,
    testName: "Search results - filter application",
    failureRate: 12,
    lastRun: "1 hour ago",
    affectedBranches: ["main"],
    errorMessage: "Element '#filter-price' is not visible",
    stackTrace: `at waitForVisible (node_modules/playwright/lib/frame.js:156)
at SearchPage.applyPriceFilter (tests/search.spec.ts:67)
at Test.run (tests/search.spec.ts:89)`,
    recentRuns: [
      { status: "pass", branch: "main", time: "1h ago" },
      { status: "pass", branch: "main", time: "2h ago" },
      { status: "fail", branch: "main", time: "4h ago" },
      { status: "pass", branch: "main", time: "6h ago" },
      { status: "pass", branch: "main", time: "8h ago" },
    ],
    correctCategory: "timing",
    categories: {
      timing: "Race condition or slow network causing intermittent timeouts",
      selector: "Element selector is fragile and breaks on certain conditions",
      environment: "Test environment instability (CI resources, external services)",
      bug: "Actual product bug that manifests intermittently",
    },
  },
  {
    id: 4,
    testName: "Dashboard - data table sorting",
    failureRate: 45,
    lastRun: "15 mins ago",
    affectedBranches: ["feature/dashboard-v2"],
    errorMessage: "Expected array to be sorted in ascending order",
    stackTrace: `at assertSorted (tests/helpers/assertions.ts:23)
at DashboardPage.verifySorting (tests/dashboard.spec.ts:112)
at Test.run (tests/dashboard.spec.ts:134)`,
    recentRuns: [
      { status: "fail", branch: "feature/dashboard-v2", time: "15m ago" },
      { status: "pass", branch: "feature/dashboard-v2", time: "45m ago" },
      { status: "fail", branch: "feature/dashboard-v2", time: "1h ago" },
      { status: "fail", branch: "feature/dashboard-v2", time: "2h ago" },
      { status: "pass", branch: "main", time: "3h ago" },
    ],
    correctCategory: "bug",
    categories: {
      timing: "Race condition or slow network causing intermittent timeouts",
      selector: "Element selector is fragile and breaks on certain conditions",
      environment: "Test environment instability (CI resources, external services)",
      bug: "Actual product bug that manifests intermittently",
    },
  },
  {
    id: 5,
    testName: "Login - OAuth redirect",
    failureRate: 8,
    lastRun: "4 hours ago",
    affectedBranches: ["main", "staging"],
    errorMessage: "NetworkError: Failed to fetch",
    stackTrace: `at fetch (node_modules/node-fetch/lib/index.js:89)
at OAuthProvider.getToken (tests/auth.spec.ts:45)
at Test.run (tests/auth.spec.ts:67)`,
    recentRuns: [
      { status: "pass", branch: "main", time: "4h ago" },
      { status: "pass", branch: "staging", time: "6h ago" },
      { status: "pass", branch: "main", time: "8h ago" },
      { status: "fail", branch: "main", time: "12h ago" },
      { status: "pass", branch: "main", time: "14h ago" },
    ],
    correctCategory: "environment",
    categories: {
      timing: "Race condition or slow network causing intermittent timeouts",
      selector: "Element selector is fragile and breaks on certain conditions",
      environment: "Test environment instability (CI resources, external services)",
      bug: "Actual product bug that manifests intermittently",
    },
  },
]

export function TriageTask({ taskIndex, onComplete, onSkip }: TriageTaskProps) {
  const task = tasks[taskIndex % tasks.length]
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [showResult, setShowResult] = useState(false)

  const handleSubmit = () => {
    const correct = selectedCategory === task.correctCategory
    setShowResult(true)

    setTimeout(() => {
      onComplete(correct)
      setSelectedCategory(null)
      setNotes("")
      setShowResult(false)
    }, 1500)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "timing":
        return Clock
      case "selector":
        return Bug
      case "environment":
        return AlertCircle
      case "bug":
        return AlertTriangle
      default:
        return HelpCircle
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "timing":
        return "text-amber-400 border-amber-500"
      case "selector":
        return "text-blue-400 border-blue-500"
      case "environment":
        return "text-purple-400 border-purple-500"
      case "bug":
        return "text-red-400 border-red-500"
      default:
        return "text-muted-foreground border-border"
    }
  }

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  task.failureRate > 50
                    ? "bg-red-500/20"
                    : task.failureRate > 25
                      ? "bg-amber-500/20"
                      : "bg-yellow-500/20"
                }`}
              >
                <AlertTriangle
                  className={`w-6 h-6 ${
                    task.failureRate > 50
                      ? "text-red-400"
                      : task.failureRate > 25
                        ? "text-amber-400"
                        : "text-yellow-400"
                  }`}
                />
              </div>
              <div>
                <h3 className="font-medium">{task.testName}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {task.failureRate}% failure rate
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {task.lastRun}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {task.affectedBranches.map((branch) => (
                <Badge key={branch} variant="outline" className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  {branch}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Error Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="error" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="error">Error</TabsTrigger>
                <TabsTrigger value="stack">Stack Trace</TabsTrigger>
              </TabsList>
              <TabsContent value="error">
                <code className="block p-3 bg-red-500/10 border border-red-500/30 rounded text-sm font-mono text-red-400 whitespace-pre-wrap">
                  {task.errorMessage}
                </code>
              </TabsContent>
              <TabsContent value="stack">
                <code className="block p-3 bg-muted rounded text-xs font-mono text-muted-foreground whitespace-pre overflow-x-auto">
                  {task.stackTrace}
                </code>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Run History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {task.recentRuns.map((run, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-3">
                    {run.status === "pass" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      <GitBranch className="w-3 h-3 mr-1" />
                      {run.branch}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{run.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Classify the Flakiness</CardTitle>
          <CardDescription>What is the most likely root cause of this flaky test?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(task.categories).map(([key, description]) => {
              const Icon = getCategoryIcon(key)
              const colorClass = getCategoryColor(key)
              const isSelected = selectedCategory === key

              return (
                <button
                  key={key}
                  onClick={() => !showResult && setSelectedCategory(key)}
                  disabled={showResult}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    showResult && key === task.correctCategory
                      ? "border-emerald-500 bg-emerald-500/10"
                      : showResult && isSelected && key !== task.correctCategory
                        ? "border-red-500 bg-red-500/10"
                        : isSelected
                          ? `${colorClass} bg-primary/5`
                          : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${isSelected ? colorClass.split(" ")[0] : "text-muted-foreground"}`} />
                    <span className="font-medium capitalize">{key}</span>
                    {showResult && key === task.correctCategory && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </button>
              )
            })}
          </div>

          {selectedCategory && !showResult && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Optional: Add triage notes</p>
              <Textarea
                placeholder="Additional context or suggested fix..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {showResult && (
            <div
              className={`p-4 rounded-lg ${
                selectedCategory === task.correctCategory
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : "bg-red-500/10 border border-red-500/30"
              }`}
            >
              <p
                className={`font-medium ${
                  selectedCategory === task.correctCategory ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {selectedCategory === task.correctCategory ? "Correct!" : "Incorrect"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This test is flaky due to: <span className="font-medium capitalize">{task.correctCategory}</span> -{" "}
                {task.categories[task.correctCategory as keyof typeof task.categories]}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onSkip} disabled={showResult} className="flex-1 bg-transparent">
              <SkipForward className="w-4 h-4 mr-2" />
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedCategory || showResult} className="flex-1">
              Submit Classification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
