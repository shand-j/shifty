"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Filter, Check, X, RefreshCw, Eye, Sparkles, ArrowRight, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface HealingItem {
  id: string
  testName: string
  testId: string
  originalSelector: string
  healedSelector: string
  confidence: number
  status: "pending" | "approved" | "rejected"
  createdAt: string
  domChanges: string
  affectedRuns: number
}

const healingItems: HealingItem[] = [
  {
    id: "h1",
    testName: "login.spec.ts",
    testId: "t1",
    originalSelector: "#submit-btn",
    healedSelector: '[data-testid="submit-btn"]',
    confidence: 98,
    status: "pending",
    createdAt: "5 min ago",
    domChanges: "Button ID removed, data-testid added",
    affectedRuns: 12,
  },
  {
    id: "h2",
    testName: "checkout.spec.ts",
    testId: "t5",
    originalSelector: ".add-to-cart-button",
    healedSelector: '[data-testid="add-to-cart"]',
    confidence: 94,
    status: "pending",
    createdAt: "15 min ago",
    domChanges: "Class name changed from add-to-cart-button to cart-btn",
    affectedRuns: 8,
  },
  {
    id: "h3",
    testName: "search.spec.ts",
    testId: "t8",
    originalSelector: "#search-input",
    healedSelector: 'input[name="query"]',
    confidence: 78,
    status: "pending",
    createdAt: "1 hour ago",
    domChanges: "Element restructured, ID removed",
    affectedRuns: 5,
  },
  {
    id: "h4",
    testName: "profile.spec.ts",
    testId: "t10",
    originalSelector: ".user-avatar",
    healedSelector: '[data-testid="user-avatar"]',
    confidence: 62,
    status: "pending",
    createdAt: "2 hours ago",
    domChanges: "Component completely refactored",
    affectedRuns: 3,
  },
  {
    id: "h5",
    testName: "navigation.spec.ts",
    testId: "t12",
    originalSelector: "#nav-menu > li:first-child",
    healedSelector: '[data-testid="nav-home"]',
    confidence: 88,
    status: "approved",
    createdAt: "3 hours ago",
    domChanges: "Navigation structure changed to use data-testid",
    affectedRuns: 15,
  },
  {
    id: "h6",
    testName: "cart.spec.ts",
    testId: "t6",
    originalSelector: ".cart-total-price",
    healedSelector: '[data-testid="cart-total"]',
    confidence: 91,
    status: "rejected",
    createdAt: "1 day ago",
    domChanges: "Selector was incorrect, manual fix needed",
    affectedRuns: 2,
  },
]

export function HealingQueue() {
  const [items, setItems] = useState(healingItems)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<HealingItem | null>(null)

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originalSelector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.healedSelector.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const pendingCount = items.filter((i) => i.status === "pending").length
  const approvedCount = items.filter((i) => i.status === "approved").length
  const rejectedCount = items.filter((i) => i.status === "rejected").length

  const handleApprove = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: "approved" as const } : item)))
  }

  const handleReject = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: "rejected" as const } : item)))
  }

  const handleBulkApprove = () => {
    setItems((prev) => prev.map((item) => (selectedIds.has(item.id) ? { ...item, status: "approved" as const } : item)))
    setSelectedIds(new Set())
  }

  const handleBulkReject = () => {
    setItems((prev) => prev.map((item) => (selectedIds.has(item.id) ? { ...item, status: "rejected" as const } : item)))
    setSelectedIds(new Set())
  }

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-chart-1/20 text-chart-1"
    if (confidence >= 70) return "bg-chart-3/20 text-chart-3"
    return "bg-destructive/20 text-destructive"
  }

  const getStatusBadge = (status: HealingItem["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="secondary" className="bg-chart-1/20 text-chart-1">
            <Check className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-destructive/20 text-destructive">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-chart-3/20 text-chart-3">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Selector Healing</h1>
          <p className="text-muted-foreground text-sm">
            {pendingCount} pending • {approvedCount} approved • {rejectedCount} rejected
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <RefreshCw className="w-4 h-4" />
          Re-analyze All
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{items.length}</p>
                <p className="text-sm text-muted-foreground">Total Heals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-3/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-chart-1/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">92%</p>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-sm text-muted-foreground">Low Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by test name or selector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-transparent"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="w-4 h-4" />
              {filterStatus === "all" ? "All Status" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterStatus("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("approved")}>Approved</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("rejected")}>Rejected</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="bg-muted/30 border-primary/50">
          <CardContent className="py-3 flex items-center justify-between">
            <span className="text-sm text-foreground">{selectedIds.size} items selected</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent text-chart-1 border-chart-1/50 hover:bg-chart-1/20"
                onClick={handleBulkApprove}
              >
                <Check className="w-4 h-4" />
                Approve Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent text-destructive border-destructive/50 hover:bg-destructive/20"
                onClick={handleBulkReject}
              >
                <X className="w-4 h-4" />
                Reject Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Healing Queue Table */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Healing Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-4 rounded-lg bg-muted/30 space-y-3",
                  selectedIds.has(item.id) && "ring-1 ring-primary",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => handleSelect(item.id)}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tests/${item.testId}`}
                          className="text-sm font-medium text-foreground hover:underline"
                        >
                          {item.testName}
                        </Link>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.domChanges}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getConfidenceColor(item.confidence)}>
                      {item.confidence}% confidence
                    </Badge>
                    <span className="text-xs text-muted-foreground">{item.createdAt}</span>
                  </div>
                </div>

                {/* Selector Diff */}
                <div className="flex items-center gap-4 font-mono text-sm">
                  <div className="flex-1 p-2 rounded bg-destructive/10 border border-destructive/20">
                    <code className="text-destructive">{item.originalSelector}</code>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 p-2 rounded bg-chart-1/10 border border-chart-1/20">
                    <code className="text-chart-1">{item.healedSelector}</code>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.affectedRuns} affected test runs</span>
                  <div className="flex items-center gap-2">
                    <Link href={`/healing/${item.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="w-4 h-4" />
                        View DOM
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        setSelectedItem(item)
                        setDialogOpen(true)
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Re-analyze
                    </Button>
                    {item.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-chart-1 hover:bg-chart-1/20"
                          onClick={() => handleApprove(item.id)}
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:bg-destructive/20"
                          onClick={() => handleReject(item.id)}
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Re-analyze Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Re-analyze Selector</DialogTitle>
            <DialogDescription>
              Request a new AI analysis for this selector healing. This will fetch the latest DOM snapshot and generate
              a new recommendation.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-foreground">{selectedItem.testName}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{selectedItem.originalSelector}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDialogOpen(false)
              }}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Re-analyze
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
