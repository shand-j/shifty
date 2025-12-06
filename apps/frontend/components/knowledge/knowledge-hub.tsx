"use client"

import type React from "react"

import { useState } from "react"
import {
  Brain,
  Search,
  MessageSquare,
  Network,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  FileText,
  Lightbulb,
  Target,
  Bot,
  User,
  Send,
  Sparkles,
  Filter,
  Plus,
  ChevronRight,
  ExternalLink,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { KnowledgeEntry, KnowledgeCategory, ChatMessage } from "@/lib/types"

const categories: KnowledgeCategory[] = [
  {
    id: "architecture",
    name: "Architecture",
    icon: "Network",
    count: 24,
    description: "System design, components, and dependencies",
  },
  {
    id: "domain",
    name: "Domain Knowledge",
    icon: "FileText",
    count: 56,
    description: "Business logic, rules, and workflows",
  },
  {
    id: "expert",
    name: "Domain Experts",
    icon: "Users",
    count: 12,
    description: "Subject matter experts and contact info",
  },
  {
    id: "date",
    name: "Important Dates",
    icon: "Calendar",
    count: 18,
    description: "Milestones, deadlines, and releases",
  },
  { id: "cost", name: "Costs & Budget", icon: "DollarSign", count: 8, description: "Resource allocation and spending" },
  {
    id: "risk",
    name: "Risk Registry",
    icon: "AlertTriangle",
    count: 31,
    description: "Identified risks and mitigations",
  },
  { id: "decision", name: "Decisions", icon: "Target", count: 42, description: "ADRs and technical decisions" },
  {
    id: "insight",
    name: "Agent Insights",
    icon: "Lightbulb",
    count: 89,
    description: "Learnings from agent operations",
  },
]

const mockEntries: KnowledgeEntry[] = [
  {
    id: "1",
    type: "architecture",
    title: "Authentication Service Architecture",
    content: "The authentication service uses OAuth 2.0 with PKCE flow...",
    summary: "OAuth 2.0 + PKCE authentication flow with JWT tokens and refresh token rotation.",
    source: "agent",
    sourceAgent: "Test Generator",
    tags: ["auth", "security", "api"],
    relatedEntities: ["AuthService", "UserController", "TokenManager"],
    confidence: 0.95,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:22:00Z",
    createdBy: "Test Generator Agent",
  },
  {
    id: "2",
    type: "risk",
    title: "Race Condition in Cart Service",
    content: "Identified potential race condition when multiple users update the same cart simultaneously...",
    summary: "Cart service has race condition risk during concurrent updates. Recommend optimistic locking.",
    source: "agent",
    sourceAgent: "Healing Agent",
    tags: ["cart", "concurrency", "critical"],
    relatedEntities: ["CartService", "InventoryService"],
    confidence: 0.88,
    createdAt: "2024-01-18T09:15:00Z",
    updatedAt: "2024-01-18T09:15:00Z",
    createdBy: "Healing Agent",
  },
  {
    id: "3",
    type: "domain",
    title: "Order Fulfillment Workflow",
    content: "Orders transition through states: pending -> confirmed -> processing -> shipped -> delivered...",
    summary: "5-stage order fulfillment with automatic notifications and inventory updates at each stage.",
    source: "session",
    tags: ["orders", "workflow", "fulfillment"],
    relatedEntities: ["OrderService", "NotificationService", "InventoryService"],
    confidence: 0.92,
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-19T11:30:00Z",
    createdBy: "QA Session - Maria",
  },
  {
    id: "4",
    type: "expert",
    title: "Payment Integration SME",
    content: "John Davis is the subject matter expert for all payment gateway integrations...",
    summary: "John Davis (john.davis@company.com) - Payment systems, Stripe, refund workflows.",
    source: "manual",
    tags: ["payments", "stripe", "expert"],
    relatedEntities: ["PaymentService", "RefundController"],
    confidence: 1.0,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z",
    createdBy: "Admin",
  },
  {
    id: "5",
    type: "date",
    title: "Q1 Release - v2.5.0",
    content: "Major release scheduled for March 15, 2024. Includes new checkout flow, mobile optimization...",
    summary: "March 15, 2024 - v2.5.0 release with checkout redesign and mobile improvements.",
    source: "manual",
    tags: ["release", "q1", "milestone"],
    relatedEntities: ["CheckoutService", "MobileApp"],
    confidence: 1.0,
    createdAt: "2024-01-05T09:00:00Z",
    updatedAt: "2024-01-22T10:00:00Z",
    createdBy: "Product Owner",
  },
  {
    id: "6",
    type: "cost",
    title: "CI/CD Infrastructure Costs",
    content: "Current monthly spend on CI/CD: $4,200. Breakdown: GitHub Actions $2,800, AWS $1,400...",
    summary: "$4,200/month CI/CD costs. 15% reduction possible with optimized test parallelization.",
    source: "pipeline",
    tags: ["costs", "ci-cd", "infrastructure"],
    relatedEntities: ["Pipeline", "TestSuite"],
    confidence: 0.97,
    createdAt: "2024-01-20T12:00:00Z",
    updatedAt: "2024-01-20T12:00:00Z",
    createdBy: "ROI Analytics Agent",
  },
  {
    id: "7",
    type: "insight",
    title: "Login Page Selector Instability Pattern",
    content: "The login page has had 12 selector breaks in the last 30 days...",
    summary: "Login page selectors are unstable. Recommend data-testid attributes for email, password, submit.",
    source: "agent",
    sourceAgent: "Healing Agent",
    tags: ["selectors", "login", "pattern"],
    relatedEntities: ["LoginPage", "AuthForm"],
    confidence: 0.91,
    createdAt: "2024-01-21T15:30:00Z",
    updatedAt: "2024-01-21T15:30:00Z",
    createdBy: "Healing Agent",
  },
  {
    id: "8",
    type: "decision",
    title: "ADR-042: Adopt Playwright for E2E Testing",
    content: "Decision: Migrate from Cypress to Playwright for E2E testing...",
    summary: "Migrating to Playwright for better parallelization, cross-browser support, and CI performance.",
    source: "manual",
    tags: ["adr", "testing", "playwright"],
    relatedEntities: ["TestSuite", "CI Pipeline"],
    confidence: 1.0,
    createdAt: "2024-01-08T14:00:00Z",
    updatedAt: "2024-01-08T14:00:00Z",
    createdBy: "Tech Lead",
  },
]

const mockChatHistory: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "What are the main risks in the checkout flow?",
    timestamp: "2024-01-22T10:30:00Z",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Based on our knowledge base, I found 3 key risks in the checkout flow:\n\n1. **Race Condition in Cart Service** - Concurrent cart updates can cause inventory mismatches. The Healing Agent identified this with 88% confidence.\n\n2. **Payment Gateway Timeout** - The Stripe integration has a 5-second timeout which can fail during high load.\n\n3. **Session Expiry** - Cart sessions expire after 30 minutes, which can frustrate users mid-checkout.\n\nWould you like me to elaborate on any of these?",
    sources: [mockEntries[1]],
    timestamp: "2024-01-22T10:30:15Z",
  },
]

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Network,
  FileText,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  Target,
  Lightbulb,
}

export function KnowledgeHub() {
  const [activeTab, setActiveTab] = useState("browse")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatHistory)
  const [chatInput, setChatInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)

  const filteredEntries = mockEntries.filter((entry) => {
    const matchesSearch =
      searchQuery === "" ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === null || entry.type === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date().toISOString(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setChatInput("")
    setIsThinking(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I searched our knowledge base for information about "${chatInput}". Here's what I found:\n\nBased on the collected insights from our agents and manual entries, I can provide context about this topic. The Test Generator and Healing agents have accumulated relevant knowledge through their operations.\n\nWould you like me to dive deeper into any specific aspect?`,
        sources: mockEntries.slice(0, 2),
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, aiResponse])
      setIsThinking(false)
    }, 1500)
  }

  const getTypeIcon = (type: KnowledgeEntry["type"]) => {
    const icons: Record<KnowledgeEntry["type"], React.ComponentType<{ className?: string }>> = {
      architecture: Network,
      domain: FileText,
      expert: Users,
      date: Calendar,
      cost: DollarSign,
      risk: AlertTriangle,
      decision: Target,
      requirement: FileText,
      insight: Lightbulb,
    }
    return icons[type]
  }

  const getSourceBadge = (source: KnowledgeEntry["source"]) => {
    const styles: Record<KnowledgeEntry["source"], string> = {
      agent: "bg-primary/20 text-primary",
      manual: "bg-muted text-muted-foreground",
      pipeline: "bg-chart-2/20 text-chart-2",
      session: "bg-chart-3/20 text-chart-3",
    }
    return styles[source]
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" />
            Knowledge Hub
          </h1>
          <p className="text-muted-foreground mt-1">Collective intelligence gathered by agents and your team</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">280</div>
                <div className="text-sm text-muted-foreground">Total Entries</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <Bot className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-muted-foreground">Agent Contributed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-3/10">
                <Clock className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-muted-foreground">Updated Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-bold">31</div>
                <div className="text-sm text-muted-foreground">Active Risks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse" className="gap-2">
            <Search className="w-4 h-4" />
            Browse & Search
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat with Knowledge
          </TabsTrigger>
          <TabsTrigger value="graph" className="gap-2">
            <Network className="w-4 h-4" />
            Knowledge Graph
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Categories */}
          <div className="grid grid-cols-4 gap-3">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon]
              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedCategory === category.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {IconComponent && <IconComponent className="w-5 h-5 text-muted-foreground" />}
                        <div>
                          <div className="font-medium text-sm">{category.name}</div>
                          <div className="text-xs text-muted-foreground">{category.count} entries</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="pipeline">Pipeline</SelectItem>
                <SelectItem value="session">Session</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Entries List */}
          <div className="space-y-3">
            {filteredEntries.map((entry) => {
              const TypeIcon = getTypeIcon(entry.type)
              return (
                <Card key={entry.id} className="hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <TypeIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{entry.title}</h3>
                          <Badge variant="outline" className={getSourceBadge(entry.source)}>
                            {entry.source === "agent" ? entry.sourceAgent : entry.source}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{entry.summary}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            {entry.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {entry.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{entry.tags.length - 3}</span>
                            )}
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Sparkles className="w-3 h-3" />
                                  {Math.round(entry.confidence * 100)}% confidence
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>AI confidence in this knowledge entry</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span className="text-xs text-muted-foreground">
                            Updated {new Date(entry.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Chat with Knowledge Base
              </CardTitle>
              <CardDescription>
                Ask questions in natural language - the AI will search and synthesize answers from all knowledge
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                      {message.role === "assistant" && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Brain className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs font-medium mb-2">Sources:</p>
                            <div className="space-y-1">
                              {message.sources.map((source) => (
                                <div
                                  key={source.id}
                                  className="text-xs bg-background/50 rounded px-2 py-1 flex items-center gap-2"
                                >
                                  <FileText className="w-3 h-3" />
                                  {source.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Brain className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="animate-pulse">Searching knowledge base...</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about architecture, risks, decisions, or any topic..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} disabled={!chatInput.trim() || isThinking}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graph">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" />
                Knowledge Graph
              </CardTitle>
              <CardDescription>Visual representation of how knowledge entities are connected</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] flex items-center justify-center">
              {/* Knowledge Graph Visualization */}
              <div className="relative w-full h-full bg-muted/30 rounded-lg overflow-hidden">
                {/* Central Node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                    <Brain className="w-8 h-8" />
                  </div>
                </div>

                {/* Connected Nodes */}
                {categories.slice(0, 6).map((cat, i) => {
                  const angle = (i * 60 * Math.PI) / 180
                  const radius = 150
                  const x = Math.cos(angle) * radius
                  const y = Math.sin(angle) * radius
                  const IconComponent = iconMap[cat.icon]

                  return (
                    <div
                      key={cat.id}
                      className="absolute top-1/2 left-1/2 transition-transform hover:scale-110"
                      style={{
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      }}
                    >
                      {/* Connection Line */}
                      <svg
                        className="absolute top-1/2 left-1/2 -z-10"
                        style={{
                          width: radius,
                          height: 2,
                          transform: `rotate(${i * 60}deg)`,
                          transformOrigin: "0 50%",
                        }}
                      >
                        <line
                          x1="0"
                          y1="1"
                          x2={radius}
                          y2="1"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-border"
                          strokeDasharray="4 4"
                        />
                      </svg>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-md cursor-pointer hover:border-primary">
                              {IconComponent && <IconComponent className="w-5 h-5 text-muted-foreground" />}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{cat.name}</p>
                            <p className="text-xs text-muted-foreground">{cat.count} entries</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )
                })}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur rounded-lg p-3 border">
                  <p className="text-xs font-medium mb-2">Graph Legend</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      Knowledge Core
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-card border" />
                      Category Node
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-0.5 border-t-2 border-dashed border-border" />
                      Relationship
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
