"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, ExternalLink } from "lucide-react"
import Link from "next/link"

interface TestStatus {
  id: string
  name: string
  suite: string
  status: "passing" | "failing" | "flaky"
  duration: string
  lastRun: string
}

const tests: TestStatus[] = [
  { id: "1", name: "login.spec.ts", suite: "Auth", status: "passing", duration: "1.2s", lastRun: "5 min ago" },
  { id: "2", name: "checkout.spec.ts", suite: "Payments", status: "failing", duration: "3.4s", lastRun: "12 min ago" },
  { id: "3", name: "search.spec.ts", suite: "Core", status: "flaky", duration: "2.1s", lastRun: "1 hour ago" },
  { id: "4", name: "profile.spec.ts", suite: "User", status: "passing", duration: "0.8s", lastRun: "2 hours ago" },
]

const statusColors = {
  passing: "bg-chart-1/20 text-chart-1",
  failing: "bg-destructive/20 text-destructive",
  flaky: "bg-chart-3/20 text-chart-3",
}

export function TestStatusTable() {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">Recent Test Runs</CardTitle>
        <Link href="/tests">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View All
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tests.map((test) => (
            <div key={test.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className={statusColors[test.status]}>
                  {test.status}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{test.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {test.suite} • {test.duration}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{test.lastRun}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
