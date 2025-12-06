"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Play, Monitor, Smartphone, Tablet, Globe, Clock, FileCode, Video } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const testPlans = [
  { id: "1", name: "Checkout Flow", tests: 12, duration: "~15 min" },
  { id: "2", name: "User Authentication", tests: 8, duration: "~10 min" },
  { id: "3", name: "Search & Discovery", tests: 15, duration: "~20 min" },
  { id: "4", name: "Full Regression", tests: 45, duration: "~45 min" },
]

export function SessionStart() {
  const router = useRouter()
  const [config, setConfig] = useState({
    name: "",
    url: "",
    testPlan: "",
    device: "desktop",
    browser: "chromium",
    recordVideo: true,
    generateTests: true,
  })

  const handleStart = () => {
    // Start session and redirect
    router.push("/sessions/new-session-id")
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sessions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Start Test Session</h1>
          <p className="text-sm text-muted-foreground">Configure and launch a new manual testing session</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session Details</CardTitle>
            <CardDescription>Name your session and set the starting URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Session Name</Label>
              <Input
                id="name"
                placeholder="e.g., Checkout Flow Testing"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Starting URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="url"
                  placeholder="https://your-app.com"
                  value={config.url}
                  onChange={(e) => setConfig({ ...config, url: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test Plan (Optional)</CardTitle>
            <CardDescription>Select a predefined test plan or start a free-form session</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={config.testPlan}
              onValueChange={(v) => setConfig({ ...config, testPlan: v })}
              className="grid grid-cols-2 gap-3"
            >
              <div
                className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  config.testPlan === ""
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground/50"
                }`}
                onClick={() => setConfig({ ...config, testPlan: "" })}
              >
                <RadioGroupItem value="" id="freeform" />
                <Label htmlFor="freeform" className="flex-1 cursor-pointer">
                  <span className="font-medium">Free-form Session</span>
                  <p className="text-xs text-muted-foreground">Explore without a predefined plan</p>
                </Label>
              </div>
              {testPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    config.testPlan === plan.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                  onClick={() => setConfig({ ...config, testPlan: plan.id })}
                >
                  <RadioGroupItem value={plan.id} id={plan.id} />
                  <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{plan.name}</span>
                      <Badge variant="secondary">{plan.tests} tests</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {plan.duration}
                    </p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Device & Browser */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Environment</CardTitle>
            <CardDescription>Select device type and browser</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Device Type</Label>
              <RadioGroup
                value={config.device}
                onValueChange={(v) => setConfig({ ...config, device: v })}
                className="flex gap-4"
              >
                <div
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${
                    config.device === "desktop" ? "border-primary bg-primary/10" : "border-border"
                  }`}
                  onClick={() => setConfig({ ...config, device: "desktop" })}
                >
                  <Monitor className="w-8 h-8" />
                  <RadioGroupItem value="desktop" id="desktop" className="sr-only" />
                  <Label htmlFor="desktop" className="text-sm cursor-pointer">
                    Desktop
                  </Label>
                </div>
                <div
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${
                    config.device === "tablet" ? "border-primary bg-primary/10" : "border-border"
                  }`}
                  onClick={() => setConfig({ ...config, device: "tablet" })}
                >
                  <Tablet className="w-8 h-8" />
                  <RadioGroupItem value="tablet" id="tablet" className="sr-only" />
                  <Label htmlFor="tablet" className="text-sm cursor-pointer">
                    Tablet
                  </Label>
                </div>
                <div
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${
                    config.device === "mobile" ? "border-primary bg-primary/10" : "border-border"
                  }`}
                  onClick={() => setConfig({ ...config, device: "mobile" })}
                >
                  <Smartphone className="w-8 h-8" />
                  <RadioGroupItem value="mobile" id="mobile" className="sr-only" />
                  <Label htmlFor="mobile" className="text-sm cursor-pointer">
                    Mobile
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="browser">Browser</Label>
              <Select value={config.browser} onValueChange={(v) => setConfig({ ...config, browser: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chromium">Chromium</SelectItem>
                  <SelectItem value="firefox">Firefox</SelectItem>
                  <SelectItem value="webkit">WebKit (Safari)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Shifty Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shifty Options</CardTitle>
            <CardDescription>AI-powered recording and test generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="recordVideo">Record Video</Label>
                  <p className="text-xs text-muted-foreground">Capture session for playback and debugging</p>
                </div>
              </div>
              <Switch
                id="recordVideo"
                checked={config.recordVideo}
                onCheckedChange={(v) => setConfig({ ...config, recordVideo: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="generateTests">Generate Playwright Tests</Label>
                  <p className="text-xs text-muted-foreground">Auto-generate tests from your actions</p>
                </div>
              </div>
              <Switch
                id="generateTests"
                checked={config.generateTests}
                onCheckedChange={(v) => setConfig({ ...config, generateTests: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button size="lg" className="w-full gap-2" onClick={handleStart} disabled={!config.url}>
          <Play className="w-5 h-5" />
          Start Session
        </Button>
      </div>
    </div>
  )
}
