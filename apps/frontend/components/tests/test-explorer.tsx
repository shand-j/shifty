"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Folder,
  FileCode,
  Play,
  Trash2,
  Tag,
  Move,
  Wand2,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface TestItem {
  id: string
  name: string
  type: "folder" | "suite" | "test"
  status?: "passing" | "failing" | "flaky" | "skipped"
  children?: TestItem[]
  tags?: string[]
  framework?: string
  lastRun?: string
}

const testTree: TestItem[] = [
  {
    id: "p1",
    name: "acme-web-app",
    type: "folder",
    children: [
      {
        id: "s1",
        name: "Authentication",
        type: "suite",
        children: [
          {
            id: "t1",
            name: "login.spec.ts",
            type: "test",
            status: "passing",
            tags: ["critical", "smoke"],
            framework: "playwright",
            lastRun: "2 min ago",
          },
          {
            id: "t2",
            name: "logout.spec.ts",
            type: "test",
            status: "passing",
            tags: ["smoke"],
            framework: "playwright",
            lastRun: "2 min ago",
          },
          {
            id: "t3",
            name: "password-reset.spec.ts",
            type: "test",
            status: "failing",
            tags: ["critical"],
            framework: "playwright",
            lastRun: "5 min ago",
          },
          {
            id: "t4",
            name: "mfa.spec.ts",
            type: "test",
            status: "flaky",
            tags: ["security"],
            framework: "playwright",
            lastRun: "1 hour ago",
          },
        ],
      },
      {
        id: "s2",
        name: "Checkout",
        type: "suite",
        children: [
          {
            id: "t5",
            name: "cart.spec.ts",
            type: "test",
            status: "passing",
            tags: ["critical"],
            framework: "playwright",
            lastRun: "10 min ago",
          },
          {
            id: "t6",
            name: "payment.spec.ts",
            type: "test",
            status: "passing",
            tags: ["critical", "payments"],
            framework: "playwright",
            lastRun: "10 min ago",
          },
          {
            id: "t7",
            name: "shipping.spec.ts",
            type: "test",
            status: "skipped",
            tags: [],
            framework: "playwright",
            lastRun: "1 day ago",
          },
        ],
      },
      {
        id: "s3",
        name: "Search",
        type: "suite",
        children: [
          {
            id: "t8",
            name: "basic-search.spec.ts",
            type: "test",
            status: "passing",
            tags: ["smoke"],
            framework: "playwright",
            lastRun: "30 min ago",
          },
          {
            id: "t9",
            name: "filters.spec.ts",
            type: "test",
            status: "flaky",
            tags: [],
            framework: "playwright",
            lastRun: "30 min ago",
          },
        ],
      },
    ],
  },
  {
    id: "p2",
    name: "acme-api",
    type: "folder",
    children: [
      {
        id: "s4",
        name: "Users API",
        type: "suite",
        children: [
          {
            id: "t10",
            name: "create-user.spec.ts",
            type: "test",
            status: "passing",
            tags: ["api"],
            framework: "jest",
            lastRun: "1 hour ago",
          },
          {
            id: "t11",
            name: "get-user.spec.ts",
            type: "test",
            status: "passing",
            tags: ["api"],
            framework: "jest",
            lastRun: "1 hour ago",
          },
        ],
      },
    ],
  },
]

const statusColors = {
  passing: "bg-chart-1/20 text-chart-1",
  failing: "bg-destructive/20 text-destructive",
  flaky: "bg-chart-3/20 text-chart-3",
  skipped: "bg-muted text-muted-foreground",
}

function TreeNode({
  item,
  level = 0,
  selectedIds,
  onSelect,
}: {
  item: TestItem
  level?: number
  selectedIds: Set<string>
  onSelect: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(level < 2)
  const hasChildren = item.children && item.children.length > 0
  const isSelected = selectedIds.has(item.id)

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer group",
          isSelected && "bg-muted",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(item.id)}
          className="opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100"
        />

        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="p-0.5">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {item.type === "folder" && <Folder className="w-4 h-4 text-chart-3" />}
        {item.type === "suite" && <Folder className="w-4 h-4 text-chart-2" />}
        {item.type === "test" && <FileCode className="w-4 h-4 text-muted-foreground" />}

        {item.type === "test" ? (
          <Link href={`/tests/${item.id}`} className="flex-1 flex items-center gap-2 min-w-0">
            <span className="text-sm text-foreground truncate">{item.name}</span>
            {item.status && (
              <Badge variant="secondary" className={cn("text-xs", statusColors[item.status])}>
                {item.status}
              </Badge>
            )}
            {item.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </Link>
        ) : (
          <span className="flex-1 text-sm text-foreground">{item.name}</span>
        )}

        {item.type === "test" && (
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">{item.lastRun}</span>
        )}

        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
          <Play className="w-3 h-3" />
        </Button>
      </div>

      {expanded && hasChildren && (
        <div>
          {item.children!.map((child) => (
            <TreeNode key={child.id} item={child} level={level + 1} selectedIds={selectedIds} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

export function TestExplorer() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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

  const totalTests = 11
  const passingTests = 7
  const failingTests = 1
  const flakyTests = 2

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Test Explorer</h1>
          <p className="text-muted-foreground text-sm">
            {totalTests} tests • {passingTests} passing • {failingTests} failing • {flakyTests} flaky
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tests/generate">
            <Button className="gap-2">
              <Wand2 className="w-4 h-4" />
              Generate Tests
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tests by name, tag, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-transparent"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuItem>Passing</DropdownMenuItem>
            <DropdownMenuItem>Failing</DropdownMenuItem>
            <DropdownMenuItem>Flaky</DropdownMenuItem>
            <DropdownMenuItem>Skipped</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Framework</DropdownMenuLabel>
            <DropdownMenuItem>Playwright</DropdownMenuItem>
            <DropdownMenuItem>Cypress</DropdownMenuItem>
            <DropdownMenuItem>Jest</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedIds.size > 0 && (
        <Card className="bg-muted/30 border-primary/50">
          <CardContent className="py-3 flex items-center justify-between">
            <span className="text-sm text-foreground">{selectedIds.size} items selected</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Play className="w-4 h-4" />
                Run Selected
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Tag className="w-4 h-4" />
                Tag
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Move className="w-4 h-4" />
                Move
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-destructive bg-transparent">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card">
        <CardContent className="p-4">
          {testTree.map((item) => (
            <TreeNode key={item.id} item={item} selectedIds={selectedIds} onSelect={handleSelect} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
