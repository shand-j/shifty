"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Play,
  Pause,
  Camera,
  Check,
  X,
  SkipForward,
  AlertCircle,
  Clock,
  Globe,
  Terminal,
  FileText,
  Paperclip,
  Send,
  Lightbulb,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SessionWorkspaceProps {
  sessionId: string
}

interface Step {
  id: string
  action: "click" | "fill" | "navigate" | "assert" | "wait"
  description: string
  status: "pending" | "pass" | "fail" | "skipped"
  screenshot?: string
}

const steps: Step[] = [
  { id: "1", action: "navigate", description: "Go to /checkout", status: "pass" },
  { id: "2", action: "assert", description: "Cart items visible", status: "pass" },
  { id: "3", action: "fill", description: "Enter shipping address", status: "pass" },
  { id: "4", action: "click", description: "Continue to payment", status: "pass" },
  { id: "5", action: "fill", description: "Enter payment details", status: "pass" },
  { id: "6", action: "click", description: "Submit order", status: "fail", screenshot: "/failed-test-screenshot.jpg" },
  { id: "7", action: "assert", description: "Order confirmation shown", status: "pending" },
  { id: "8", action: "click", description: "Download receipt", status: "pending" },
]

const logs = [
  { time: "14:32:01", level: "info", message: "Navigating to /checkout" },
  { time: "14:32:02", level: "info", message: "Page loaded in 1.2s" },
  { time: "14:32:03", level: "info", message: "Found 3 cart items" },
  { time: "14:32:05", level: "info", message: "Filling shipping form" },
  { time: "14:32:08", level: "info", message: "Clicking continue button" },
  { time: "14:32:10", level: "warn", message: "Payment gateway slow response" },
  { time: "14:32:15", level: "error", message: "Payment submission failed: timeout" },
  { time: "14:32:15", level: "info", message: "Screenshot captured" },
]

const actionIcons = {
  click: "cursor-pointer",
  fill: "type",
  navigate: "navigation",
  assert: "check-circle",
  wait: "clock",
}

export function SessionWorkspace({ sessionId }: SessionWorkspaceProps) {
  const [currentStep, setCurrentStep] = useState(5)
  const [isRunning, setIsRunning] = useState(false)
  const [notes, setNotes] = useState("")
  const [browserUrl, setBrowserUrl] = useState("https://acme.dev/checkout")
  const [timer, setTimer] = useState("00:45:32")

  const getStepIcon = (status: Step["status"]) => {
    switch (status) {
      case "pass":
        return <Check className="w-4 h-4 text-chart-1" />
      case "fail":
        return <X className="w-4 h-4 text-destructive" />
      case "skipped":
        return <SkipForward className="w-4 h-4 text-muted-foreground" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
    }
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col -m-6">
      {/* Top Bar */}
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/sessions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-medium text-foreground">Checkout Flow Regression</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="bg-chart-1/20 text-chart-1">
                Active
              </Badge>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{timer}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Camera className="w-4 h-4" />
            Screenshot
          </Button>
          {isRunning ? (
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => setIsRunning(false)}>
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          ) : (
            <Button size="sm" className="gap-2" onClick={() => setIsRunning(true)}>
              <Play className="w-4 h-4" />
              Resume
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Step Rail */}
        <div className="w-72 border-r border-border bg-card shrink-0 flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-medium text-foreground">Steps</h2>
            <p className="text-sm text-muted-foreground">
              {steps.filter((s) => s.status === "pass").length}/{steps.length} completed
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                    currentStep === index ? "bg-muted" : "hover:bg-muted/50",
                  )}
                >
                  <div className="mt-0.5">{getStepIcon(step.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{step.description}</p>
                    <p className="text-xs text-muted-foreground capitalize">{step.action}</p>
                  </div>
                  {step.status === "fail" && <AlertCircle className="w-4 h-4 text-destructive shrink-0" />}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Browser Viewport */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Browser Chrome */}
          <div className="h-12 border-b border-border bg-card flex items-center gap-2 px-4 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <Input
                value={browserUrl}
                onChange={(e) => setBrowserUrl(e.target.value)}
                className="flex-1 border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Viewport Content */}
          <div className="flex-1 bg-muted/30 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Browser Viewport</p>
              <p className="text-sm">
                Embedded browser would render here
                <br />
                (Playwright cloud or self-hosted)
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-96 border-l border-border bg-card shrink-0 flex flex-col">
          <Tabs defaultValue="logs" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-12 px-4">
              <TabsTrigger value="logs" className="gap-2">
                <Terminal className="w-4 h-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="artifacts" className="gap-2">
                <Paperclip className="w-4 h-4" />
                Artifacts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2 font-mono text-xs">
                  {logs.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-muted-foreground">{log.time}</span>
                      <span
                        className={cn(
                          log.level === "error" && "text-destructive",
                          log.level === "warn" && "text-chart-3",
                          log.level === "info" && "text-muted-foreground",
                        )}
                      >
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="text-foreground">{log.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="notes" className="flex-1 m-0 p-4 flex flex-col">
              <Textarea
                placeholder="Add notes about this session..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 resize-none bg-muted/30"
              />
              <Button className="mt-4 gap-2">
                <Send className="w-4 h-4" />
                Save Notes
              </Button>
            </TabsContent>

            <TabsContent value="artifacts" className="flex-1 m-0 p-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-3">
                  <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">step-6-failure.png</p>
                    <p className="text-xs text-muted-foreground">Screenshot • 245 KB</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-3">
                  <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">network-trace.har</p>
                    <p className="text-xs text-muted-foreground">HAR File • 1.2 MB</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* AI Suggestions */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-chart-3" />
              <span className="text-sm font-medium text-foreground">AI Suggestions</span>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-left h-auto py-2 bg-transparent">
                <span className="text-xs text-muted-foreground">What if you try a different card number?</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-left h-auto py-2 bg-transparent">
                <span className="text-xs text-muted-foreground">Check network tab for API errors</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
