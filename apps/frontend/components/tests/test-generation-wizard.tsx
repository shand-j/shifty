"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Wand2,
  Upload,
  FileText,
  Code,
  GitBranch,
  Check,
  Copy,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Step = "input" | "generating" | "review" | "commit"

const generatedCode = `import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('should successfully register a new user', async ({ page }) => {
    // Fill in registration form
    await page.fill('[data-testid="first-name"]', 'John');
    await page.fill('[data-testid="last-name"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john.doe@example.com');
    await page.fill('[data-testid="password"]', 'SecurePass123!');
    await page.fill('[data-testid="confirm-password"]', 'SecurePass123!');
    
    // Accept terms and conditions
    await page.check('[data-testid="terms-checkbox"]');
    
    // Submit form
    await page.click('[data-testid="submit-btn"]');
    
    // Verify successful registration
    await expect(page).toHaveURL('/welcome');
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Welcome to our platform');
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    // Submit empty form
    await page.click('[data-testid="submit-btn"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="email-error"]'))
      .toContainText('Email is required');
    await expect(page.locator('[data-testid="password-error"]'))
      .toContainText('Password is required');
  });

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.fill('[data-testid="password"]', 'SecurePass123!');
    await page.fill('[data-testid="confirm-password"]', 'DifferentPass456!');
    await page.click('[data-testid="submit-btn"]');
    
    await expect(page.locator('[data-testid="password-match-error"]'))
      .toContainText('Passwords do not match');
  });
});`

export function TestGenerationWizard() {
  const [step, setStep] = useState<Step>("input")
  const [inputType, setInputType] = useState<"text" | "file" | "jira">("text")
  const [requirement, setRequirement] = useState("")
  const [progress, setProgress] = useState(0)
  const [framework, setFramework] = useState("playwright")
  const [branch, setBranch] = useState("")
  const [prTitle, setPrTitle] = useState("")

  const handleGenerate = () => {
    setStep("generating")
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setStep("review")
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleCommit = () => {
    setStep("commit")
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Generate Tests</h1>
        <p className="text-muted-foreground text-sm">Use AI to generate comprehensive test cases from requirements</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {[
          { key: "input", label: "Input", icon: FileText },
          { key: "generating", label: "Generating", icon: Wand2 },
          { key: "review", label: "Review", icon: Code },
          { key: "commit", label: "Commit", icon: GitBranch },
        ].map((s, index) => {
          const Icon = s.icon
          const isActive = s.key === step
          const isPast = ["input", "generating", "review", "commit"].indexOf(step) > index

          return (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isPast
                      ? "bg-chart-1 text-chart-1-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isPast ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={cn("text-sm", isActive ? "text-foreground font-medium" : "text-muted-foreground")}>
                {s.label}
              </span>
              {index < 3 && <ArrowRight className="w-4 h-4 text-muted-foreground ml-2" />}
            </div>
          )
        })}
      </div>

      {/* Step 1: Input */}
      {step === "input" && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Describe Your Test Requirements</CardTitle>
            <CardDescription>Paste a requirement, upload a spec file, or connect to a Jira epic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={inputType} onValueChange={(v) => setInputType(v as typeof inputType)}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="text" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="file" className="gap-2">
                  <Upload className="w-4 h-4" />
                  File
                </TabsTrigger>
                <TabsTrigger value="jira" className="gap-2">
                  <Badge variant="outline" className="px-1">
                    J
                  </Badge>
                  Jira
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4">
                <Textarea
                  placeholder="Enter your requirement in plain English, Gherkin format, or paste a code diff...

Example:
As a user, I want to be able to register for an account so that I can access the platform.

Acceptance Criteria:
- User can fill in first name, last name, email, and password
- Password must be at least 8 characters with one uppercase and one number
- User must accept terms and conditions
- On successful registration, user is redirected to welcome page"
                  className="min-h-48 bg-muted/30"
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                />
              </TabsContent>

              <TabsContent value="file" className="mt-4">
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium">Drop your spec file here</p>
                  <p className="text-sm text-muted-foreground mt-1">Supports .feature, .md, .txt, .json files</p>
                  <Button variant="outline" className="mt-4 bg-transparent">
                    Browse Files
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="jira" className="mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Jira Epic or Story URL</Label>
                    <Input placeholder="https://acme.atlassian.net/browse/AUTH-123" className="bg-muted/30" />
                  </div>
                  <Button variant="outline" className="bg-transparent">
                    Connect to Jira
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center gap-4">
              <div className="space-y-2 flex-1">
                <Label>Target Framework</Label>
                <Select value={framework} onValueChange={setFramework}>
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="playwright">Playwright</SelectItem>
                    <SelectItem value="cypress">Cypress</SelectItem>
                    <SelectItem value="jest">Jest</SelectItem>
                    <SelectItem value="vitest">Vitest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleGenerate} disabled={!requirement} className="gap-2">
                <Wand2 className="w-4 h-4" />
                Generate Tests
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Generating */}
      {step === "generating" && (
        <Card className="bg-card">
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">Generating Tests</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  AI is analyzing your requirements and generating comprehensive test cases...
                </p>
              </div>
              <Progress value={progress} className="max-w-md mx-auto" />
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span>
                  {progress < 30
                    ? "Analyzing requirements..."
                    : progress < 60
                      ? "Generating test scenarios..."
                      : progress < 90
                        ? "Adding assertions and edge cases..."
                        : "Finalizing..."}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === "review" && (
        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Generated Tests</CardTitle>
                <CardDescription>Review and edit the generated test code</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-chart-1/20 text-chart-1">
                  <Check className="w-3 h-3 mr-1" />
                  Type Check Passed
                </Badge>
                <Badge variant="secondary" className="bg-chart-1/20 text-chart-1">
                  <Check className="w-3 h-3 mr-1" />
                  Lint Passed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-muted/30 rounded-lg p-4 overflow-x-auto text-sm max-h-96">
                  <code className="text-foreground font-mono">{generatedCode}</code>
                </pre>
                <Button variant="ghost" size="sm" className="absolute top-2 right-2 gap-1">
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-chart-3/50">
            <CardContent className="py-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-chart-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">AI Suggestions</p>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• Consider adding tests for password strength validation</li>
                  <li>• The email validation test could include format checks</li>
                  <li>• You might want to add a test for duplicate email registration</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("input")} className="bg-transparent">
              Back to Edit
            </Button>
            <Button onClick={handleCommit} className="gap-2">
              <GitBranch className="w-4 h-4" />
              Commit to Repository
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Commit */}
      {step === "commit" && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Commit to Repository</CardTitle>
            <CardDescription>Create a pull request with the generated tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input
                  placeholder="feat/add-registration-tests"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Pull Request Title</Label>
                <Input
                  placeholder="Add automated tests for user registration flow"
                  value={prTitle}
                  onChange={(e) => setPrTitle(e.target.value)}
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Reviewers</Label>
                <Select>
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="Select reviewers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alex">Alex Kim</SelectItem>
                    <SelectItem value="jordan">Jordan Lee</SelectItem>
                    <SelectItem value="casey">Casey Patel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("review")} className="bg-transparent">
                Back to Review
              </Button>
              <Button className="gap-2">
                <GitBranch className="w-4 h-4" />
                Create Pull Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
