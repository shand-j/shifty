"use client"

import { useState } from "react"
import {
  GitPullRequest,
  Check,
  X,
  Clock,
  FileCode,
  GitBranch,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Tag,
  TestTube2,
  Wrench,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface AgentPR {
  id: string
  title: string
  type: "selector-heal" | "test-generation" | "label-addition" | "flaky-fix" | "data-setup"
  branch: string
  baseBranch: string
  status: "pending" | "approved" | "rejected" | "merged"
  createdAt: string
  files: number
  additions: number
  deletions: number
  description: string
  relatedTest?: string
  confidence: number
  reviewComments: number
}

const agentPRs: AgentPR[] = [
  {
    id: "pr-1",
    title: "fix: Update selector for login button",
    type: "selector-heal",
    branch: "shifty/heal-login-selector-abc123",
    baseBranch: "main",
    status: "pending",
    createdAt: "10 min ago",
    files: 1,
    additions: 2,
    deletions: 2,
    description:
      'The login button selector `#submit-btn` was changed to `[data-testid="submit-btn"]`. This PR updates the test to use the new selector.',
    relatedTest: "login.spec.ts",
    confidence: 98,
    reviewComments: 0,
  },
  {
    id: "pr-2",
    title: "feat: Add test-id labels to checkout components",
    type: "label-addition",
    branch: "shifty/add-labels-checkout-def456",
    baseBranch: "main",
    status: "pending",
    createdAt: "25 min ago",
    files: 4,
    additions: 12,
    deletions: 0,
    description:
      "Based on HITL labeling feedback, this PR adds data-testid attributes to checkout components that were identified as lacking robust selectors.",
    confidence: 92,
    reviewComments: 2,
  },
  {
    id: "pr-3",
    title: "test: Generate tests for user profile API",
    type: "test-generation",
    branch: "shifty/gen-tests-profile-ghi789",
    baseBranch: "main",
    status: "pending",
    createdAt: "1 hour ago",
    files: 2,
    additions: 145,
    deletions: 0,
    description:
      "AI-generated integration tests for the user profile API endpoints. Covers GET, PUT, and DELETE operations with various edge cases.",
    confidence: 85,
    reviewComments: 1,
  },
  {
    id: "pr-4",
    title: "fix: Add retry logic for flaky network test",
    type: "flaky-fix",
    branch: "shifty/fix-flaky-network-jkl012",
    baseBranch: "main",
    status: "approved",
    createdAt: "2 hours ago",
    files: 1,
    additions: 8,
    deletions: 3,
    description:
      "The network timeout test was flaky due to race conditions. This PR adds proper wait conditions and retry logic.",
    relatedTest: "network.spec.ts",
    confidence: 94,
    reviewComments: 0,
  },
  {
    id: "pr-5",
    title: "chore: Set up test data for order flow",
    type: "data-setup",
    branch: "shifty/setup-order-data-mno345",
    baseBranch: "main",
    status: "merged",
    createdAt: "1 day ago",
    files: 3,
    additions: 56,
    deletions: 12,
    description:
      "Creates seed data and fixtures for order flow testing. Includes mock products, users, and payment methods.",
    confidence: 88,
    reviewComments: 3,
  },
]

const getTypeIcon = (type: AgentPR["type"]) => {
  switch (type) {
    case "selector-heal":
      return <Sparkles className="w-4 h-4" />
    case "test-generation":
      return <TestTube2 className="w-4 h-4" />
    case "label-addition":
      return <Tag className="w-4 h-4" />
    case "flaky-fix":
      return <Wrench className="w-4 h-4" />
    case "data-setup":
      return <FileCode className="w-4 h-4" />
  }
}

const getTypeLabel = (type: AgentPR["type"]) => {
  switch (type) {
    case "selector-heal":
      return "Selector Heal"
    case "test-generation":
      return "Test Generation"
    case "label-addition":
      return "Label Addition"
    case "flaky-fix":
      return "Flaky Fix"
    case "data-setup":
      return "Data Setup"
  }
}

const getStatusBadge = (status: AgentPR["status"]) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-0">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      )
    case "approved":
      return (
        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-0">
          <Check className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-0">
          <X className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      )
    case "merged":
      return (
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-0">
          <GitPullRequest className="w-3 h-3 mr-1" />
          Merged
        </Badge>
      )
  }
}

export function AgentPRsReview() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPR, setSelectedPR] = useState<AgentPR | null>(null)
  const [reviewComment, setReviewComment] = useState("")

  const pendingCount = agentPRs.filter((pr) => pr.status === "pending").length
  const approvedCount = agentPRs.filter((pr) => pr.status === "approved").length

  const filteredPRs = agentPRs.filter(
    (pr) =>
      pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.branch.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Agent PRs for Review</h1>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pending review • {approvedCount} approved
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            View in GitHub
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agentPRs.filter((pr) => pr.type === "selector-heal").length}</p>
                <p className="text-sm text-muted-foreground">Selector Heals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TestTube2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agentPRs.filter((pr) => pr.type === "test-generation").length}</p>
                <p className="text-sm text-muted-foreground">Test Generations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Tag className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agentPRs.filter((pr) => pr.type === "label-addition").length}</p>
                <p className="text-sm text-muted-foreground">Label Additions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <GitPullRequest className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agentPRs.filter((pr) => pr.status === "merged").length}</p>
                <p className="text-sm text-muted-foreground">Merged</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search PRs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* PR List */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="all">All PRs</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {filteredPRs
            .filter((pr) => pr.status === "pending")
            .map((pr) => (
              <PRCard key={pr.id} pr={pr} onSelect={setSelectedPR} />
            ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-3">
          {filteredPRs.map((pr) => (
            <PRCard key={pr.id} pr={pr} onSelect={setSelectedPR} />
          ))}
        </TabsContent>
      </Tabs>

      {/* PR Detail Dialog */}
      <Dialog open={!!selectedPR} onOpenChange={() => setSelectedPR(null)}>
        <DialogContent className="max-w-2xl">
          {selectedPR && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedPR.type)}
                  {selectedPR.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4 pt-2">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-4 h-4" />
                    {selectedPR.branch}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span>{selectedPR.baseBranch}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  {getStatusBadge(selectedPR.status)}
                  <Badge variant="outline">{getTypeLabel(selectedPR.type)}</Badge>
                  <Badge variant="outline" className="border-primary text-primary">
                    {selectedPR.confidence}% confidence
                  </Badge>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm">{selectedPR.description}</p>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>{selectedPR.files} files changed</span>
                  <span className="text-emerald-400">+{selectedPR.additions}</span>
                  <span className="text-red-400">-{selectedPR.deletions}</span>
                  {selectedPR.relatedTest && (
                    <span className="flex items-center gap-1">
                      <FileCode className="w-4 h-4" />
                      {selectedPR.relatedTest}
                    </span>
                  )}
                </div>

                {selectedPR.status === "pending" && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Review Comment (Optional)</label>
                    <Textarea
                      placeholder="Add a comment..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                {selectedPR.status === "pending" ? (
                  <>
                    <Button variant="outline" onClick={() => setSelectedPR(null)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" className="gap-2">
                      <X className="w-4 h-4" />
                      Request Changes
                    </Button>
                    <Button className="gap-2">
                      <Check className="w-4 h-4" />
                      Approve & Merge
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setSelectedPR(null)}>
                    Close
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PRCard({ pr, onSelect }: { pr: AgentPR; onSelect: (pr: AgentPR) => void }) {
  return (
    <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onSelect(pr)}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-10 h-10 bg-primary/20">
              <AvatarFallback className="bg-primary/20 text-primary">{getTypeIcon(pr.type)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{pr.title}</h3>
                {getStatusBadge(pr.status)}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  {pr.branch.split("/").slice(-1)[0]}
                </span>
                <span>{pr.createdAt}</span>
                <span className="text-emerald-400">+{pr.additions}</span>
                <span className="text-red-400">-{pr.deletions}</span>
                {pr.reviewComments > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {pr.reviewComments}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{getTypeLabel(pr.type)}</Badge>
            <Badge variant="outline" className="border-primary text-primary">
              {pr.confidence}%
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
