"use client"

import { StatCard } from "../widgets/stat-card"
import { TestStatusTable } from "../widgets/test-status-table"
import { PipelineStatus } from "../widgets/pipeline-status"
import { MiniChart } from "../widgets/mini-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { GitPullRequest, AlertTriangle, Sparkles, Zap, Wand2 } from "lucide-react"

const coverageData = [
  { name: "W1", value: 78 },
  { name: "W2", value: 81 },
  { name: "W3", value: 79 },
  { name: "W4", value: 84 },
]

export function DevDashboard() {
  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My PRs" value={4} icon={<GitPullRequest className="w-4 h-4" />} />
        <StatCard
          title="Flaky in My Repos"
          value={2}
          change={-50}
          changeLabel="vs last week"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <StatCard
          title="Auto-healed"
          value={18}
          change={24}
          changeLabel="this week"
          icon={<Sparkles className="w-4 h-4" />}
        />
        <StatCard
          title="Fast Feedback"
          value="28s"
          change={15}
          changeLabel="faster"
          icon={<Zap className="w-4 h-4" />}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Test Generation Prompt */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Generate Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste a requirement, user story, or code diff to generate tests..."
                className="min-h-24 bg-muted/30 border-muted"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Supports Gherkin, TypeScript, plain English</p>
                <Button className="gap-2">
                  <Wand2 className="w-4 h-4" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>

          <PipelineStatus />
          <TestStatusTable />
        </div>
        <div className="space-y-6">
          <MiniChart title="Coverage Trend" data={coverageData} color="#3b82f6" valueSuffix="%" />

          {/* Flakiness Radar */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Flakiness Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "checkout.spec.ts", flakeRate: 12 },
                  { name: "search.spec.ts", flakeRate: 8 },
                ].map((test) => (
                  <div key={test.name} className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground truncate">{test.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-chart-3 rounded-full" style={{ width: `${test.flakeRate * 5}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{test.flakeRate}%</span>
                    </div>
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
