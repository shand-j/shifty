"use client"

import { useState } from "react"
import { MousePointer2, Tag, HelpCircle, SkipForward, Check, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface LabelingTaskProps {
  taskIndex: number
  onComplete: (correct: boolean) => void
  onSkip: () => void
}

const tasks = [
  {
    id: 1,
    screenshot: "/simple-login-form.png",
    highlightedElement: { x: 120, y: 80, width: 260, height: 40 },
    elementType: "input",
    question: "What is this UI element?",
    options: ["Text Input", "Button", "Dropdown", "Checkbox"],
    correctAnswer: "Text Input",
    followUp: {
      question: "What is the purpose of this input?",
      options: ["Email Address", "Password", "Username", "Search"],
      correctAnswer: "Email Address",
    },
  },
  {
    id: 2,
    screenshot: "/ecommerce-product-card-with-add-to-cart-button.jpg",
    highlightedElement: { x: 100, y: 220, width: 120, height: 36 },
    elementType: "button",
    question: "What is this UI element?",
    options: ["Text Input", "Button", "Link", "Image"],
    correctAnswer: "Button",
    followUp: {
      question: "What action does this button perform?",
      options: ["Add to Cart", "Buy Now", "View Details", "Remove"],
      correctAnswer: "Add to Cart",
    },
  },
  {
    id: 3,
    screenshot: "/navigation-menu-with-dropdown.jpg",
    highlightedElement: { x: 200, y: 20, width: 100, height: 30 },
    elementType: "nav",
    question: "What is this UI element?",
    options: ["Navigation Link", "Button", "Heading", "Breadcrumb"],
    correctAnswer: "Navigation Link",
    followUp: {
      question: "What type of navigation is this?",
      options: ["Primary Nav", "Footer Nav", "Sidebar Nav", "Breadcrumb"],
      correctAnswer: "Primary Nav",
    },
  },
  {
    id: 4,
    screenshot: "/settings-toggle-switch-for-notifications.jpg",
    highlightedElement: { x: 350, y: 120, width: 50, height: 26 },
    elementType: "toggle",
    question: "What is this UI element?",
    options: ["Checkbox", "Toggle Switch", "Radio Button", "Button"],
    correctAnswer: "Toggle Switch",
    followUp: {
      question: "What does this toggle control?",
      options: ["Notifications", "Dark Mode", "Sound", "Privacy"],
      correctAnswer: "Notifications",
    },
  },
  {
    id: 5,
    screenshot: "/modal-dialog-with-close-button.jpg",
    highlightedElement: { x: 420, y: 40, width: 30, height: 30 },
    elementType: "button",
    question: "What is this UI element?",
    options: ["Icon Button", "Text Link", "Badge", "Avatar"],
    correctAnswer: "Icon Button",
    followUp: {
      question: "What is the purpose of this button?",
      options: ["Close Modal", "Minimize", "Maximize", "Settings"],
      correctAnswer: "Close Modal",
    },
  },
  {
    id: 6,
    screenshot: "/search-bar-with-magnifying-glass-icon.jpg",
    highlightedElement: { x: 150, y: 15, width: 300, height: 40 },
    elementType: "search",
    question: "What is this UI element?",
    options: ["Search Input", "Text Input", "Filter", "Command Palette"],
    correctAnswer: "Search Input",
    followUp: {
      question: "What type of search is this?",
      options: ["Global Search", "Filter Search", "Autocomplete", "Command"],
      correctAnswer: "Global Search",
    },
  },
  {
    id: 7,
    screenshot: "/data-table-with-sortable-columns.jpg",
    highlightedElement: { x: 80, y: 50, width: 100, height: 30 },
    elementType: "header",
    question: "What is this UI element?",
    options: ["Table Header", "Tab", "Button", "Badge"],
    correctAnswer: "Table Header",
    followUp: {
      question: "What feature does this header have?",
      options: ["Sortable", "Filterable", "Resizable", "Draggable"],
      correctAnswer: "Sortable",
    },
  },
  {
    id: 8,
    screenshot: "/pagination-controls-with-page-numbers.jpg",
    highlightedElement: { x: 180, y: 260, width: 200, height: 36 },
    elementType: "pagination",
    question: "What is this UI element?",
    options: ["Pagination", "Tabs", "Breadcrumb", "Steps"],
    correctAnswer: "Pagination",
    followUp: {
      question: "What type of pagination is this?",
      options: ["Numbered Pages", "Infinite Scroll", "Load More", "Cursor"],
      correctAnswer: "Numbered Pages",
    },
  },
  {
    id: 9,
    screenshot: "/dropdown-select-menu-expanded.jpg",
    highlightedElement: { x: 100, y: 100, width: 200, height: 150 },
    elementType: "dropdown",
    question: "What is this UI element?",
    options: ["Dropdown Menu", "Context Menu", "Modal", "Popover"],
    correctAnswer: "Dropdown Menu",
    followUp: {
      question: "What is the interaction pattern?",
      options: ["Single Select", "Multi Select", "Command Menu", "Navigation"],
      correctAnswer: "Single Select",
    },
  },
  {
    id: 10,
    screenshot: "/toast-notification-success-message.jpg",
    highlightedElement: { x: 280, y: 20, width: 200, height: 60 },
    elementType: "toast",
    question: "What is this UI element?",
    options: ["Toast Notification", "Alert Banner", "Modal", "Tooltip"],
    correctAnswer: "Toast Notification",
    followUp: {
      question: "What type of notification is this?",
      options: ["Success", "Error", "Warning", "Info"],
      correctAnswer: "Success",
    },
  },
]

export function LabelingTask({ taskIndex, onComplete, onSkip }: LabelingTaskProps) {
  const task = tasks[taskIndex % tasks.length]
  const [step, setStep] = useState<"main" | "followup">("main")
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleSubmit = () => {
    const correct =
      step === "main" ? selectedAnswer === task.correctAnswer : selectedAnswer === task.followUp.correctAnswer

    setIsCorrect(correct)
    setShowFeedback(true)

    setTimeout(() => {
      if (step === "main" && correct) {
        setStep("followup")
        setSelectedAnswer("")
        setShowFeedback(false)
      } else {
        onComplete(correct && step === "followup")
        setStep("main")
        setSelectedAnswer("")
        setShowFeedback(false)
      }
    }, 1000)
  }

  const currentQuestion = step === "main" ? task.question : task.followUp.question
  const currentOptions = step === "main" ? task.options : task.followUp.options

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Screenshot Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MousePointer2 className="w-4 h-4" />
            Identify the Highlighted Element
          </CardTitle>
          <CardDescription>Look at the highlighted area in the screenshot below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-muted rounded-lg overflow-hidden">
            <img src={task.screenshot || "/placeholder.svg"} alt="UI Screenshot" className="w-full h-auto" />
            {/* Highlight overlay */}
            <div
              className="absolute border-2 border-primary bg-primary/20 rounded animate-pulse"
              style={{
                left: task.highlightedElement.x,
                top: task.highlightedElement.y,
                width: task.highlightedElement.width,
                height: task.highlightedElement.height,
              }}
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline">Element Type: {task.elementType}</Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your labels help train our AI to better understand UI patterns</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Question Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="w-4 h-4" />
            {step === "main" ? "Step 1: Identify" : "Step 2: Classify"}
          </CardTitle>
          <CardDescription>{currentQuestion}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3">
            {currentOptions.map((option) => (
              <div
                key={option}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  showFeedback && selectedAnswer === option
                    ? isCorrect
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-red-500 bg-red-500/10"
                    : selectedAnswer === option
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <RadioGroupItem value={option} id={option} disabled={showFeedback} />
                <Label htmlFor={option} className="flex-1 cursor-pointer">
                  {option}
                </Label>
                {showFeedback &&
                  selectedAnswer === option &&
                  (isCorrect ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-red-500" />)}
              </div>
            ))}
          </RadioGroup>

          {showFeedback && (
            <div
              className={`p-3 rounded-lg ${isCorrect ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
            >
              {isCorrect
                ? "Correct! Great job."
                : `Incorrect. The answer was: ${step === "main" ? task.correctAnswer : task.followUp.correctAnswer}`}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onSkip} disabled={showFeedback} className="flex-1 bg-transparent">
              <SkipForward className="w-4 h-4 mr-2" />
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedAnswer || showFeedback} className="flex-1">
              Submit Answer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
