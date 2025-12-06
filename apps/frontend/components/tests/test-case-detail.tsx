"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Edit,
  History,
  Sparkles,
  ExternalLink,
  Clock,
  User,
  Calendar,
  Tag,
  Copy,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TestCaseDetailProps {
  testId: string
}

const mockTest = {
  id: "t1",
  name: "login.spec.ts",
  suite: "Authentication",
  project: "acme-web-app",
  status: "passing" as const,
  tags: ["critical", "smoke"],
  owner: "Sarah Chen",
  framework: "playwright",
  createdAt: "2024-10-15",
  updatedAt: "2024-12-05",
  code: `import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="submit-btn"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-msg"]'))
      .toContainText('Welcome back');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="submit-btn"]');
    
    await expect(page.locator('[data-testid="error-msg"]'))
      .toBeVisible();
  });
});`,
  runHistory: [
    { id: "r1", status: "passing", duration: "1.2s", timestamp: "2 min ago", screenshot: null },
    { id: "r2", status: "passing", duration: "1.1s", timestamp: "1 hour ago", screenshot: null },
    {
      id: "r3",
      status: "failing",
      duration: "1.8s",
      timestamp: "3 hours ago",
      screenshot: "/failed-test-screenshot.jpg",
    },
    { id: "r4", status: "passing", duration: "1.3s", timestamp: "1 day ago", screenshot: null },
    { id: "r5", status: "flaky", duration: "2.1s", timestamp: "2 days ago", screenshot: null },
  ],
  healingHistory: [
    {
      id: "h1",
      original: "#submit-btn",
      healed: '[data-testid="submit-btn"]',
      confidence: 98,
      status: "approved",
      timestamp: "1 week ago",
    },
    {
      id: "h2",
      original: '.login-form input[type="email"]',
      healed: '[data-testid="email"]',
      confidence: 94,
      status: "approved",
      timestamp: "2 weeks ago",
    },
  ],
  linkedArtifacts: [
    { id: "a1", type: "jira", title: "AUTH-123: Implement login flow", url: "#" },
    { id: "a2", type: "figma", title: "Login Screen Design", url: "#" },
    { id: "a3", type: "slack", title: "#auth-team discussion", url: "#" },
  ],
}

const statusColors = {
  passing: "bg-chart-1/20 text-chart-1",
  failing: "bg-destructive/20 text-destructive",
  flaky: "bg-chart-3/20 text-chart-3",
  skipped: "bg-muted text-muted-foreground",
}

export function TestCaseDetail({ testId }: TestCaseDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const test = mockTest

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{test.project}</span>
            <ChevronRight className="w-4 h-4" />
            <span>{test.suite}</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-3">
            {test.name}
            <Badge variant="secondary" className={statusColors[test.status]}>
              {test.status}
            </Badge>
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {test.owner}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Updated {test.updatedAt}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {test.tags.join(", ")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <History className="w-4 h-4" />
            History
          </Button>
          <Button className="gap-2">
            <Play className="w-4 h-4" />
            Run Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Code Editor */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Test Code</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-1">
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  className={cn("gap-1", !isEditing && "bg-transparent")}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4" />
                  {isEditing ? "Save" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted/30 rounded-lg p-4 overflow-x-auto text-sm">
                <code className="text-foreground font-mono">{test.code}</code>
              </pre>
            </CardContent>
          </Card>

          {/* Tabs for History */}
          <Tabs defaultValue="runs" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="runs">Run History</TabsTrigger>
              <TabsTrigger value="healing">Healing History</TabsTrigger>
            </TabsList>

            <TabsContent value="runs">
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {test.runHistory.map((run) => (
                      <div key={run.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className={statusColors[run.status as keyof typeof statusColors]}>
                            {run.status}
                          </Badge>
                          <span className="text-sm text-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {run.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{run.timestamp}</span>
                          {run.screenshot && (
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

            <TabsContent value="healing">
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {test.healingHistory.map((heal) => (
                      <div key={heal.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <Badge
                              variant="secondary"
                              className={
                                heal.confidence >= 90 ? "bg-chart-1/20 text-chart-1" : "bg-chart-3/20 text-chart-3"
                              }
                            >
                              {heal.confidence}% confidence
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={
                                heal.status === "approved"
                                  ? "bg-chart-1/20 text-chart-1"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {heal.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{heal.timestamp}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Original</p>
                            <code className="text-destructive bg-destructive/10 px-2 py-1 rounded">
                              {heal.original}
                            </code>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Healed</p>
                            <code className="text-chart-1 bg-chart-1/10 px-2 py-1 rounded">{heal.healed}</code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Framework</p>
                <p className="text-sm text-foreground capitalize">{test.framework}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {test.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm text-foreground">{test.createdAt}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm text-foreground">{test.updatedAt}</p>
              </div>
            </CardContent>
          </Card>

          {/* Linked Artifacts */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Linked Artifacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {test.linkedArtifacts.map((artifact) => (
                <a
                  key={artifact.id}
                  href={artifact.url}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Badge variant="secondary" className="text-xs capitalize">
                    {artifact.type}
                  </Badge>
                  <span className="text-sm text-foreground truncate">{artifact.title}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                </a>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-2">
                + Link Artifact
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
