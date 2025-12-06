"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitBranch, ExternalLink, RotateCcw } from "lucide-react"
import Link from "next/link"

interface Pipeline {
  id: string
  repo: string
  branch: string
  status: "running" | "passed" | "failed"
  duration: string
  tests: { passed: number; failed: number }
}

const pipelines: Pipeline[] = [
  {
    id: "1",
    repo: "acme/web-app",
    branch: "main",
    status: "passed",
    duration: "4m 32s",
    tests: { passed: 142, failed: 0 },
  },
  {
    id: "2",
    repo: "acme/api",
    branch: "feature/auth",
    status: "failed",
    duration: "2m 18s",
    tests: { passed: 86, failed: 3 },
  },
  {
    id: "3",
    repo: "acme/mobile",
    branch: "develop",
    status: "running",
    duration: "1m 45s",
    tests: { passed: 54, failed: 0 },
  },
]

const statusConfig = {
  running: { color: "bg-chart-2/20 text-chart-2", label: "Running" },
  passed: { color: "bg-chart-1/20 text-chart-1", label: "Passed" },
  failed: { color: "bg-destructive/20 text-destructive", label: "Failed" },
}

export function PipelineStatus() {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Status</CardTitle>
        <Link href="/pipelines">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View All
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pipelines.map((pipeline) => (
            <div key={pipeline.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <GitBranch className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{pipeline.repo}</p>
                  <p className="text-xs text-muted-foreground">
                    {pipeline.branch} • {pipeline.duration}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={statusConfig[pipeline.status].color}>
                  {statusConfig[pipeline.status].label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {pipeline.tests.passed}/{pipeline.tests.passed + pipeline.tests.failed}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
