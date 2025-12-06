"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Eye, Accessibility, Gauge, Play, Timer, Target } from "lucide-react"
import { cn } from "@/lib/utils"

const sessionTypes = [
  {
    value: "scripted",
    label: "Scripted",
    description: "Follow a predefined test script",
    icon: FileText,
    color: "border-chart-2 bg-chart-2/10",
  },
  {
    value: "exploratory",
    label: "Exploratory",
    description: "Free-form testing with session-based approach",
    icon: Eye,
    color: "border-chart-3 bg-chart-3/10",
  },
  {
    value: "accessibility",
    label: "Accessibility",
    description: "WCAG compliance and a11y audit",
    icon: Accessibility,
    color: "border-chart-4 bg-chart-4/10",
  },
  {
    value: "performance",
    label: "Performance",
    description: "Load times and Core Web Vitals",
    icon: Gauge,
    color: "border-chart-1 bg-chart-1/10",
  },
]

export function NewSessionForm() {
  const [sessionType, setSessionType] = useState("scripted")
  const [name, setName] = useState("")
  const [charter, setCharter] = useState("")
  const [timeBox, setTimeBox] = useState("30")

  const isExploratory = sessionType === "exploratory"

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">New Session</h1>
        <p className="text-muted-foreground text-sm">Create a new testing session</p>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Session Type</CardTitle>
          <CardDescription>Choose the type of testing session you want to run</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={sessionType} onValueChange={setSessionType} className="grid grid-cols-2 gap-4">
            {sessionTypes.map((type) => {
              const Icon = type.icon
              return (
                <Label
                  key={type.value}
                  htmlFor={type.value}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                    sessionType === type.value ? type.color : "border-border hover:border-muted-foreground/50",
                  )}
                >
                  <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-foreground">{type.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                  </div>
                </Label>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Session Name</Label>
            <Input
              id="name"
              placeholder="e.g., Checkout Flow Regression"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/30"
            />
          </div>

          {isExploratory && (
            <>
              <div className="space-y-2">
                <Label htmlFor="charter" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Session Charter
                </Label>
                <Textarea
                  id="charter"
                  placeholder="Explore the checkout process focusing on error handling and edge cases. Look for issues with invalid input, network failures, and concurrent operations."
                  value={charter}
                  onChange={(e) => setCharter(e.target.value)}
                  className="min-h-24 bg-muted/30"
                />
                <p className="text-xs text-muted-foreground">
                  Define your mission statement - what are you exploring and why?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timebox" className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Time Box
                </Label>
                <Select value={timeBox} onValueChange={setTimeBox}>
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Set a focused time limit for your exploratory session</p>
              </div>
            </>
          )}

          {!isExploratory && (
            <div className="space-y-2">
              <Label htmlFor="script">Test Script (Optional)</Label>
              <Select>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Select an existing test script..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkout">Checkout Flow Test Plan</SelectItem>
                  <SelectItem value="auth">Authentication Test Plan</SelectItem>
                  <SelectItem value="search">Search Functionality Test Plan</SelectItem>
                  <SelectItem value="profile">User Profile Test Plan</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Or create a new test script during the session</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="url">Starting URL</Label>
            <Input id="url" placeholder="https://acme.dev/checkout" className="bg-muted/30" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" className="bg-transparent">
          Save as Draft
        </Button>
        <Button className="gap-2">
          <Play className="w-4 h-4" />
          Start Session
        </Button>
      </div>
    </div>
  )
}
