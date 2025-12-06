"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  GitBranch,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Check,
  X,
  FileText,
  Terminal,
  Package,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PipelineDetailProps {
  pipelineId: string
}

interface Job {
  id: string
  name: string
  status: "passed" | "failed" | "running" | "pending"
  duration: string
  dependencies?: string[]
}

const jobs: Job[] = [
  { id: "j1", name: "Install Dependencies", status: "passed", duration: "45s" },
  { id: "j2", name: "Lint & Type Check", status: "passed", duration: "32s", dependencies: ["j1"] },
  { id: "j3", name: "Unit Tests", status: "passed", duration: "1m 12s", dependencies: ["j1"] },
  { id: "j4", name: "Integration Tests", status: "failed", duration: "2m 45s", dependencies: ["j2", "j3"] },
  { id: "j5", name: "E2E Tests", status: "pending", duration: "-", dependencies: ["j4"] },
  { id: "j6", name: "Deploy Preview", status: "pending", duration: "-", dependencies: ["j5"] },
]

const testResults = [
  { id: "t1", name: "login.spec.ts", status: "passed", duration: "1.2s" },
  { id: "t2", name: "logout.spec.ts", status: "passed", duration: "0.8s" },
  { id: "t3", name: "checkout.spec.ts", status: "failed", duration: "3.4s", error: "Timeout waiting for element" },
  { id: "t4", name: "payment.spec.ts", status: "failed", duration: "2.1s", error: "Assertion failed: expected 200" },
  { id: "t5", name: "search.spec.ts", status: "passed", duration: "1.5s" },
  {
    id: "t6",
    name: "profile.spec.ts",
    status: "failed",
    duration: "1.8s",
    error: "Element not found: #save-button",
  },
]

const healingItems = [
  {
    id: "h1",
    testName: "checkout.spec.ts",
    original: "#submit-order",
    healed: '[data-testid="submit-order"]',
    confidence: 96,
    status: "pending",
  },
  {
    id: "h2",
    testName: "payment.spec.ts",
    original: ".card-input",
    healed: '[data-testid="card-number"]',
    confidence: 89,
    status: "pending",
  },
]

const logs = `[14:32:01] Starting pipeline...
[14:32:02] Cloning repository acme/web-app@feature/payments
[14:32:05] Installing dependencies...
[14:32:45] Dependencies installed successfully
[14:32:46] Running lint...
[14:33:02] Lint passed with 0 errors
[14:33:03] Running type check...
[14:33:18] Type check passed
[14:33:19] Running unit tests...
[14:34:31] Unit tests: 86 passed, 0 failed
[14:34:32] Running integration tests...
[14:35:45] Integration tests: 52 passed, 3 failed
[14:35:45] FAILED: checkout.spec.ts - Timeout waiting for element
[14:35:45] FAILED: payment.spec.ts - Assertion failed
[14:35:45] FAILED: profile.spec.ts - Element not found
[14:35:46] Pipeline failed with 3 test failures
[14:35:46] Auto-healing analysis started...
[14:35:48] Found 2 potential selector heals
[14:35:48] Pipeline complete`

export function PipelineDetail({ pipelineId }: PipelineDetailProps) {
  const [selectedJob, setSelectedJob] = useState<string | null>("j4")

  const getJobIcon = (status: Job["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-5 h-5 text-chart-1" />
      case "failed":
        return <XCircle className="w-5 h-5 text-destructive" />
      case "running":
        return <div className="w-5 h-5 rounded-full border-2 border-chart-2 border-t-transparent animate-spin" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pipelines">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">acme/web-app</h1>
              <Badge variant="secondary" className="bg-muted text-muted-foreground gap-1">
                <GitBranch className="w-3 h-3" />
                feature/payments
              </Badge>
              <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                Failed
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">fix: payment validation • Alex Kim • 15 min ago</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Artifacts
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <RotateCcw className="w-4 h-4" />
            Re-run
          </Button>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Duration</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">2m 18s</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-chart-1" />
              <span className="text-sm text-muted-foreground">Tests Passed</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">138 / 142</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Tests Failed</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">3</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Auto-healed</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">2</p>
          </CardContent>
        </Card>
      </div>

      {/* Stage Graph */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {jobs.map((job, index) => (
              <div key={job.id} className="flex items-center">
                <button
                  onClick={() => setSelectedJob(job.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors min-w-48",
                    selectedJob === job.id ? "border-primary bg-primary/10" : "border-border bg-muted/30",
                    job.status === "failed" && "border-destructive/50",
                  )}
                >
                  {getJobIcon(job.status)}
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{job.name}</p>
                    <p className="text-xs text-muted-foreground">{job.duration}</p>
                  </div>
                </button>
                {index < jobs.length - 1 && <ChevronRight className="w-5 h-5 text-muted-foreground mx-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="tests" className="gap-2">
            <FileText className="w-4 h-4" />
            Test Results
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Terminal className="w-4 h-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="healing" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Healing
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              2
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="artifacts" className="gap-2">
            <Package className="w-4 h-4" />
            Artifacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                {testResults.map((test) => (
                  <div
                    key={test.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      test.status === "failed" ? "bg-destructive/10" : "bg-muted/30",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {test.status === "passed" ? (
                        <CheckCircle className="w-5 h-5 text-chart-1" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{test.name}</p>
                        {test.error && <p className="text-xs text-destructive mt-0.5">{test.error}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{test.duration}</span>
                      {test.status === "failed" && (
                        <Button variant="ghost" size="sm" className="gap-1">
                          <ExternalLink className="w-4 h-4" />
                          Screenshot
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="bg-card">
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <pre className="p-4 text-sm font-mono text-foreground whitespace-pre-wrap">
                  {logs.split("\n").map((line, index) => (
                    <div
                      key={index}
                      className={cn(
                        "py-0.5",
                        line.includes("FAILED") && "text-destructive bg-destructive/10",
                        line.includes("passed") && "text-chart-1",
                        line.includes("Starting") && "text-chart-2",
                      )}
                    >
                      {line}
                    </div>
                  ))}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="healing">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Selectors healed during this run
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healingItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{item.testName}</span>
                        <Badge
                          variant="secondary"
                          className={
                            item.confidence >= 90 ? "bg-chart-1/20 text-chart-1" : "bg-chart-3/20 text-chart-3"
                          }
                        >
                          {item.confidence}% confidence
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-1 text-chart-1 hover:bg-chart-1/20">
                          <Check className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:bg-destructive/20">
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-sm">
                      <div className="flex-1 p-2 rounded bg-destructive/10 border border-destructive/20">
                        <code className="text-destructive">{item.original}</code>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 p-2 rounded bg-chart-1/10 border border-chart-1/20">
                        <code className="text-chart-1">{item.healed}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artifacts">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="space-y-3">
                {[
                  { name: "test-report.html", size: "245 KB", type: "Report" },
                  { name: "coverage.json", size: "128 KB", type: "Coverage" },
                  { name: "playwright-trace.zip", size: "2.4 MB", type: "Trace" },
                  { name: "screenshots.zip", size: "1.8 MB", type: "Screenshots" },
                ].map((artifact) => (
                  <div key={artifact.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{artifact.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {artifact.type} • {artifact.size}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
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
