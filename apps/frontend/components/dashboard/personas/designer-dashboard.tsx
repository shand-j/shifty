"use client"

import { useState } from "react"
import Link from "next/link"
import { StatCard } from "../widgets/stat-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Figma, Eye, AlertCircle, ExternalLink, Upload, Play, Video, FileCode, ArrowRight, Layers } from "lucide-react"

const designMappings = [
  { id: "1", figmaFrame: "Login Screen", coverage: 92, tests: 12, lastSync: "2 hours ago" },
  { id: "2", figmaFrame: "Dashboard", coverage: 78, tests: 24, lastSync: "1 day ago" },
  { id: "3", figmaFrame: "Settings Panel", coverage: 45, tests: 6, lastSync: "3 days ago" },
  { id: "4", figmaFrame: "Checkout Flow", coverage: 88, tests: 18, lastSync: "5 hours ago" },
]

const a11yIssues = [
  { id: "1", component: "Button Group", type: "Color Contrast", severity: "warning", wcag: "1.4.3" },
  { id: "2", component: "Modal Dialog", type: "Focus Trap", severity: "error", wcag: "2.4.3" },
  { id: "3", component: "Navigation", type: "Missing Labels", severity: "warning", wcag: "1.1.1" },
  { id: "4", component: "Form Input", type: "Error Identification", severity: "error", wcag: "3.3.1" },
]

const recordedSessions = [
  { id: "1", name: "Checkout Flow Recording", duration: "3:45", steps: 12, status: "completed", testsGenerated: 8 },
  { id: "2", name: "User Onboarding", duration: "5:20", steps: 18, status: "processing", testsGenerated: 0 },
  { id: "3", name: "Search Flow", duration: "2:15", steps: 8, status: "completed", testsGenerated: 5 },
]

export function DesignerDashboard() {
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [recordDialogOpen, setRecordDialogOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Design Coverage"
          value="72%"
          change={8}
          changeLabel="vs last sprint"
          icon={<Figma className="w-4 h-4" />}
        />
        <StatCard
          title="A11y Score"
          value="86"
          change={4}
          changeLabel="improvement"
          icon={<Eye className="w-4 h-4" />}
        />
        <StatCard
          title="A11y Issues"
          value={a11yIssues.length}
          change={-30}
          changeLabel="vs last audit"
          icon={<AlertCircle className="w-4 h-4" />}
        />
        <StatCard
          title="Tests from Recordings"
          value={recordedSessions.reduce((a, s) => a + s.testsGenerated, 0)}
          change={15}
          changeLabel="this week"
          icon={<Video className="w-4 h-4" />}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Design-to-Test Automation</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Import designs or record workflows to automatically generate Playwright tests
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2 bg-transparent">
                        <Upload className="w-4 h-4" />
                        Import Design
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Import Design</DialogTitle>
                        <DialogDescription>
                          Import a Figma design or upload screenshots to map to test coverage
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Figma URL</Label>
                          <Input placeholder="https://figma.com/file/..." />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or</span>
                          </div>
                        </div>
                        <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Drop design files here or click to upload</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or PDF up to 10MB</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button>Import & Analyze</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Video className="w-4 h-4" />
                        Record Workflow
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Record Workflow</DialogTitle>
                        <DialogDescription>
                          Walk through your design manually and we'll generate Playwright tests automatically
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Session Name</Label>
                          <Input placeholder="e.g., Checkout Flow Recording" />
                        </div>
                        <div className="space-y-2">
                          <Label>Starting URL</Label>
                          <Input placeholder="https://your-app.com/start-page" />
                        </div>
                        {isRecording ? (
                          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                            <div className="w-4 h-4 bg-red-500 rounded-full mx-auto animate-pulse mb-3" />
                            <p className="font-medium">Recording in progress...</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Navigate through your app. All interactions will be captured.
                            </p>
                            <Button
                              variant="destructive"
                              className="mt-4"
                              onClick={() => {
                                setIsRecording(false)
                                setRecordDialogOpen(false)
                              }}
                            >
                              Stop Recording
                            </Button>
                          </div>
                        ) : (
                          <div className="p-6 bg-muted/30 rounded-lg text-center">
                            <Play className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Click start to begin recording your workflow
                            </p>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setRecordDialogOpen(false)}>
                          Cancel
                        </Button>
                        {!isRecording && (
                          <Button onClick={() => setIsRecording(true)} className="gap-2">
                            <Play className="w-4 h-4" />
                            Start Recording
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recorded Sessions */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Recorded Sessions
                </CardTitle>
                <CardDescription>Your workflow recordings and generated tests</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View All
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recordedSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Video className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{session.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.duration} • {session.steps} steps
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {session.status === "completed" ? (
                        <>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                            <FileCode className="w-3 h-3 mr-1" />
                            {session.testsGenerated} tests
                          </Badge>
                          <Button variant="outline" size="sm">
                            View Tests
                          </Button>
                        </>
                      ) : (
                        <Badge className="bg-blue-500/20 text-blue-400 border-0">Processing...</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Design-to-Test Mapper */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Figma className="w-4 h-4" />
                Design-to-Test Mapper
              </CardTitle>
              <Button variant="outline" size="sm">
                Connect Figma
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {designMappings.map((mapping) => (
                  <div key={mapping.id} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-card-foreground">{mapping.figmaFrame}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Synced {mapping.lastSync}</span>
                        <span className="text-sm text-muted-foreground">{mapping.tests} tests</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={mapping.coverage} className="flex-1 h-2" />
                      <span className="text-sm font-medium text-card-foreground w-12">{mapping.coverage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* A11y Audit */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Accessibility Audit</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Full Report
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {a11yIssues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={
                          issue.severity === "error"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-chart-3/20 text-chart-3"
                        }
                      >
                        {issue.severity}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{issue.component}</p>
                        <p className="text-xs text-muted-foreground">
                          {issue.type} (WCAG {issue.wcag})
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Generate Test
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          {/* UX Outcome Tracker */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">UX Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { journey: "Signup Flow", completion: 94 },
                  { journey: "Checkout", completion: 87 },
                  { journey: "Search → Purchase", completion: 72 },
                  { journey: "Settings Update", completion: 96 },
                ].map((outcome) => (
                  <div key={outcome.journey} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{outcome.journey}</span>
                      <span className="text-card-foreground">{outcome.completion}%</span>
                    </div>
                    <Progress value={outcome.completion} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-between bg-transparent" asChild>
                  <Link href="/sessions/start">
                    Start Recording Session
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  Run A11y Audit
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  View All Recordings
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
