"use client"

import { useState } from "react"
import { Code2, SkipForward, CheckCircle2, XCircle, HelpCircle, GitCompare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VerifyHealingTaskProps {
  taskIndex: number
  onComplete: (correct: boolean) => void
  onSkip: () => void
}

const tasks = [
  {
    id: 1,
    testName: "Login form submission",
    originalSelector: "button.submit-btn",
    healedSelector: "button[type='submit']",
    confidence: 92,
    context: "The button class was renamed during a CSS refactor",
    screenshotBefore: "/login-form-with-submit-button-old-style.jpg",
    screenshotAfter: "/login-form-with-submit-button-new-style.jpg",
    isValidHeal: true,
    explanation: "The healed selector uses a semantic attribute that's more stable than class names",
  },
  {
    id: 2,
    testName: "Add to cart button click",
    originalSelector: "#add-cart-123",
    healedSelector: "div.product-card button",
    confidence: 78,
    context: "Product IDs are now dynamically generated",
    screenshotBefore: "/product-card-with-add-to-cart-button.jpg",
    screenshotAfter: "/product-card-with-add-to-cart-button-different-id.jpg",
    isValidHeal: false,
    explanation: "This selector is too broad and could match multiple buttons on the page",
  },
  {
    id: 3,
    testName: "Navigation menu click",
    originalSelector: "nav > ul > li:nth-child(3) > a",
    healedSelector: "a[href='/products']",
    confidence: 95,
    context: "Menu items were reordered in the latest redesign",
    screenshotBefore: "/navigation-menu-products-link-third-position.jpg",
    screenshotAfter: "/navigation-menu-products-link-second-position.jpg",
    isValidHeal: true,
    explanation: "Using the href attribute is more stable than positional selectors",
  },
  {
    id: 4,
    testName: "Search input focus",
    originalSelector: "input#search",
    healedSelector: "input[placeholder='Search...']",
    confidence: 85,
    context: "The search input ID was removed during component refactoring",
    screenshotBefore: "/placeholder.svg?height=200&width=350",
    screenshotAfter: "/placeholder.svg?height=200&width=350",
    isValidHeal: true,
    explanation: "Placeholder text is reasonably stable for search inputs",
  },
  {
    id: 5,
    testName: "Modal close button",
    originalSelector: ".modal .close-btn",
    healedSelector: "[aria-label='Close dialog']",
    confidence: 97,
    context: "Modal component was replaced with a new accessible version",
    screenshotBefore: "/placeholder.svg?height=200&width=350",
    screenshotAfter: "/placeholder.svg?height=200&width=350",
    isValidHeal: true,
    explanation: "ARIA labels are semantic and stable selectors for accessibility controls",
  },
]

export function VerifyHealingTask({ taskIndex, onComplete, onSkip }: VerifyHealingTaskProps) {
  const task = tasks[taskIndex % tasks.length]
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null)
  const [feedback, setFeedback] = useState("")
  const [showResult, setShowResult] = useState(false)

  const handleSubmit = () => {
    const correct = (decision === "approve") === task.isValidHeal
    setShowResult(true)

    setTimeout(() => {
      onComplete(correct)
      setDecision(null)
      setFeedback("")
      setShowResult(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Test Info Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{task.testName}</h3>
              <p className="text-sm text-muted-foreground mt-1">{task.context}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Confidence: {task.confidence}%</Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Review if the AI-suggested selector correctly identifies the same element as the original</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Selector Comparison */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GitCompare className="w-4 h-4" />
              Selector Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <XCircle className="w-3 h-3 text-red-400" />
                Original (Broken)
              </p>
              <code className="block p-3 bg-red-500/10 border border-red-500/30 rounded text-sm font-mono text-red-400">
                {task.originalSelector}
              </code>
            </div>
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Healed (Suggested)
              </p>
              <code className="block p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-sm font-mono text-emerald-400">
                {task.healedSelector}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Screenshots */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Visual Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Before (Broken)</p>
                <img
                  src={task.screenshotBefore || "/placeholder.svg"}
                  alt="Before screenshot"
                  className="w-full rounded border"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">After (Current)</p>
                <img
                  src={task.screenshotAfter || "/placeholder.svg"}
                  alt="After screenshot"
                  className="w-full rounded border"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decision Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Decision</CardTitle>
          <CardDescription>Does the healed selector correctly target the same element?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant={decision === "approve" ? "default" : "outline"}
              className={`flex-1 h-16 ${decision === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
              onClick={() => setDecision("approve")}
              disabled={showResult}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Approve Heal
            </Button>
            <Button
              variant={decision === "reject" ? "default" : "outline"}
              className={`flex-1 h-16 ${decision === "reject" ? "bg-red-600 hover:bg-red-700" : ""}`}
              onClick={() => setDecision("reject")}
              disabled={showResult}
            >
              <XCircle className="w-5 h-5 mr-2" />
              Reject Heal
            </Button>
          </div>

          {decision && !showResult && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Optional: Add feedback</p>
              <Textarea
                placeholder="Why did you make this decision? (helps improve the AI)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {showResult && (
            <div
              className={`p-4 rounded-lg ${
                (decision === "approve") === task.isValidHeal
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : "bg-red-500/10 border border-red-500/30"
              }`}
            >
              <p
                className={`font-medium ${
                  (decision === "approve") === task.isValidHeal ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {(decision === "approve") === task.isValidHeal ? "Correct!" : "Incorrect"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{task.explanation}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onSkip} disabled={showResult} className="flex-1 bg-transparent">
              <SkipForward className="w-4 h-4 mr-2" />
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={!decision || showResult} className="flex-1">
              Submit Decision
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
