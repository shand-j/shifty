"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, ExternalLink } from "lucide-react"
import Link from "next/link"

interface HealingItem {
  id: string
  testName: string
  selector: string
  confidence: number
}

const healingItems: HealingItem[] = [
  { id: "1", testName: "login.spec.ts", selector: '#submit-btn → button[type="submit"]', confidence: 94 },
  { id: "2", testName: "cart.spec.ts", selector: '.add-to-cart → [data-testid="add-cart"]', confidence: 78 },
  { id: "3", testName: "search.spec.ts", selector: '#search-input → input[name="q"]', confidence: 62 },
]

export function HealingQueuePreview() {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-chart-1/20 text-chart-1"
    if (confidence >= 70) return "bg-chart-3/20 text-chart-3"
    return "bg-destructive/20 text-destructive"
  }

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">Healing Queue</CardTitle>
        <Link href="/healing">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View All
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {healingItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{item.testName}</p>
                <p className="text-xs font-mono text-muted-foreground truncate">{item.selector}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge variant="secondary" className={getConfidenceColor(item.confidence)}>
                  {item.confidence}%
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-chart-1 hover:bg-chart-1/20">
                  <Check className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/20">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
