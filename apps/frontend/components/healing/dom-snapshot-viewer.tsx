"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Check,
  X,
  Play,
  Search,
  Plus,
  Minus,
  Code,
  Eye,
  Copy,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DOMSnapshotViewerProps {
  healingId: string
}

interface DOMNode {
  id: string
  tag: string
  attributes: Record<string, string>
  children?: DOMNode[]
  text?: string
  changed?: "added" | "removed" | "modified"
}

const originalDOM: DOMNode = {
  id: "root",
  tag: "div",
  attributes: { class: "login-container" },
  children: [
    {
      id: "form",
      tag: "form",
      attributes: { class: "login-form", action: "/login" },
      children: [
        {
          id: "email-group",
          tag: "div",
          attributes: { class: "form-group" },
          children: [
            { id: "email-label", tag: "label", attributes: { for: "email" }, text: "Email" },
            {
              id: "email-input",
              tag: "input",
              attributes: { type: "email", id: "email", class: "form-input", placeholder: "Enter email" },
            },
          ],
        },
        {
          id: "password-group",
          tag: "div",
          attributes: { class: "form-group" },
          children: [
            { id: "password-label", tag: "label", attributes: { for: "password" }, text: "Password" },
            {
              id: "password-input",
              tag: "input",
              attributes: { type: "password", id: "password", class: "form-input" },
            },
          ],
        },
        {
          id: "submit-btn",
          tag: "button",
          attributes: { type: "submit", id: "submit-btn", class: "btn btn-primary" },
          text: "Login",
          changed: "removed",
        },
      ],
    },
  ],
}

const currentDOM: DOMNode = {
  id: "root",
  tag: "div",
  attributes: { class: "login-container" },
  children: [
    {
      id: "form",
      tag: "form",
      attributes: { class: "login-form", action: "/login" },
      children: [
        {
          id: "email-group",
          tag: "div",
          attributes: { class: "form-group" },
          children: [
            { id: "email-label", tag: "label", attributes: { for: "email" }, text: "Email" },
            {
              id: "email-input",
              tag: "input",
              attributes: {
                type: "email",
                "data-testid": "email",
                class: "form-input",
                placeholder: "Enter email",
              },
              changed: "modified",
            },
          ],
        },
        {
          id: "password-group",
          tag: "div",
          attributes: { class: "form-group" },
          children: [
            { id: "password-label", tag: "label", attributes: { for: "password" }, text: "Password" },
            {
              id: "password-input",
              tag: "input",
              attributes: { type: "password", "data-testid": "password", class: "form-input" },
              changed: "modified",
            },
          ],
        },
        {
          id: "submit-btn-new",
          tag: "button",
          attributes: { type: "submit", "data-testid": "submit-btn", class: "btn btn-primary" },
          text: "Login",
          changed: "added",
        },
      ],
    },
  ],
}

function DOMTreeNode({
  node,
  level = 0,
  selectedId,
  onSelect,
}: {
  node: DOMNode
  level?: number
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(level < 3)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedId === node.id

  const getChangeColor = () => {
    switch (node.changed) {
      case "added":
        return "bg-chart-1/10 border-l-2 border-chart-1"
      case "removed":
        return "bg-destructive/10 border-l-2 border-destructive"
      case "modified":
        return "bg-chart-3/10 border-l-2 border-chart-3"
      default:
        return ""
    }
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-muted/50 font-mono text-sm",
          getChangeColor(),
          isSelected && "bg-primary/20 ring-1 ring-primary",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="p-0.5">
            {expanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        <span className="text-chart-2">&lt;{node.tag}</span>
        {Object.entries(node.attributes).map(([key, value]) => (
          <span key={key}>
            <span className="text-chart-3"> {key}</span>
            <span className="text-muted-foreground">=</span>
            <span className="text-chart-4">&quot;{value}&quot;</span>
          </span>
        ))}
        <span className="text-chart-2">&gt;</span>
        {node.text && <span className="text-foreground ml-1">{node.text}</span>}
        {!hasChildren && <span className="text-chart-2">&lt;/{node.tag}&gt;</span>}

        {node.changed && (
          <Badge
            variant="secondary"
            className={cn(
              "ml-2 text-xs",
              node.changed === "added" && "bg-chart-1/20 text-chart-1",
              node.changed === "removed" && "bg-destructive/20 text-destructive",
              node.changed === "modified" && "bg-chart-3/20 text-chart-3",
            )}
          >
            {node.changed}
          </Badge>
        )}
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <DOMTreeNode key={child.id} node={child} level={level + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
          <div className="font-mono text-sm text-chart-2" style={{ paddingLeft: `${level * 16 + 28}px` }}>
            &lt;/{node.tag}&gt;
          </div>
        </div>
      )}
    </div>
  )
}

export function DOMSnapshotViewer({ healingId }: DOMSnapshotViewerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectorInput, setSelectorInput] = useState('[data-testid="submit-btn"]')
  const [matchedElements, setMatchedElements] = useState<string[]>(["submit-btn-new"])

  const handleTestSelector = () => {
    // Simulate selector matching
    if (selectorInput.includes("submit-btn")) {
      setMatchedElements(["submit-btn-new"])
    } else if (selectorInput.includes("email")) {
      setMatchedElements(["email-input"])
    } else {
      setMatchedElements([])
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/healing">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">DOM Snapshot Viewer</h1>
            <p className="text-muted-foreground text-sm">login.spec.ts • #submit-btn healing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent text-chart-1 border-chart-1/50 hover:bg-chart-1/20">
            <Check className="w-4 h-4" />
            Approve
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-transparent text-destructive border-destructive/50 hover:bg-destructive/20"
          >
            <X className="w-4 h-4" />
            Reject
          </Button>
        </div>
      </div>

      {/* Healing Info Card */}
      <Card className="bg-card">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Original Selector</p>
                <code className="text-sm font-mono text-destructive">#submit-btn</code>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Healed Selector</p>
                <code className="text-sm font-mono text-chart-1">[data-testid=&quot;submit-btn&quot;]</code>
              </div>
            </div>
            <Badge variant="secondary" className="bg-chart-1/20 text-chart-1">
              98% confidence
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original DOM */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Minus className="w-4 h-4 text-destructive" />
              Original DOM
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-lg p-2 max-h-96 overflow-auto">
              <DOMTreeNode node={originalDOM} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </CardContent>
        </Card>

        {/* Current DOM */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-chart-1" />
              Current DOM
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-lg p-2 max-h-96 overflow-auto">
              <DOMTreeNode node={currentDOM} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selector Playground */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Code className="w-4 h-4" />
            Selector Playground
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter a selector to test..."
                value={selectorInput}
                onChange={(e) => setSelectorInput(e.target.value)}
                className="pl-9 font-mono bg-muted/30"
              />
            </div>
            <Button onClick={handleTestSelector} className="gap-2">
              <Play className="w-4 h-4" />
              Test
            </Button>
          </div>

          {matchedElements.length > 0 ? (
            <div className="p-3 rounded-lg bg-chart-1/10 border border-chart-1/20">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-chart-1" />
                <span className="text-sm text-chart-1">
                  {matchedElements.length} element{matchedElements.length !== 1 ? "s" : ""} matched
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {matchedElements.map((el) => (
                  <code key={el} className="block text-sm font-mono text-foreground">
                    {el}
                  </code>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">No elements matched</span>
            </div>
          )}

          {/* Quick Selectors */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Quick test:</span>
            {['[data-testid="submit-btn"]', '[data-testid="email"]', ".btn-primary"].map((selector) => (
              <Button
                key={selector}
                variant="outline"
                size="sm"
                className="font-mono text-xs bg-transparent"
                onClick={() => {
                  setSelectorInput(selector)
                }}
              >
                {selector}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-card">
        <CardContent className="py-4">
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-chart-1" />
              <span className="text-sm text-foreground">Added</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive" />
              <span className="text-sm text-foreground">Removed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-chart-3" />
              <span className="text-sm text-foreground">Modified</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
