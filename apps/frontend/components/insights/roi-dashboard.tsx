"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  DollarSign,
  Clock,
  TrendingUp,
  Users,
  Download,
  Calendar,
  Sparkles,
  Bug,
  TestTube2,
  Zap,
  Settings,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from "recharts"

const roiSummary = {
  totalSaved: "$248,500",
  hoursSaved: 1245,
  testsGenerated: 892,
  selectorsHealed: 3456,
  bugsCaught: 178,
}

const monthlySavings = [
  { month: "Jan", hours: 85, cost: 12750 },
  { month: "Feb", hours: 102, cost: 15300 },
  { month: "Mar", hours: 118, cost: 17700 },
  { month: "Apr", hours: 145, cost: 21750 },
  { month: "May", hours: 168, cost: 25200 },
  { month: "Jun", hours: 192, cost: 28800 },
]

const savingsBreakdown = [
  { category: "Test Generation", hours: 456, cost: 68400, icon: TestTube2, color: "#14b8a6" },
  { category: "Selector Healing", hours: 312, cost: 46800, icon: Sparkles, color: "#3b82f6" },
  { category: "Flaky Test Fixes", hours: 234, cost: 35100, icon: Bug, color: "#f59e0b" },
  { category: "CI Optimization", hours: 178, cost: 26700, icon: Zap, color: "#8b5cf6" },
  { category: "Manual QA Reduction", hours: 65, cost: 9750, icon: Users, color: "#ec4899" },
]

const comparisonData = [
  { metric: "Manual Test Writing", before: 40, after: 8, unit: "hrs/sprint" },
  { metric: "Selector Maintenance", before: 16, after: 2, unit: "hrs/sprint" },
  { metric: "Flaky Test Investigation", before: 12, after: 3, unit: "hrs/sprint" },
  { metric: "Test Coverage", before: 45, after: 84, unit: "%" },
  { metric: "CI Pipeline Duration", before: 45, after: 18, unit: "min" },
]

export function ROIDashboard() {
  const [timeRange, setTimeRange] = useState("6m")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/insights">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Insights
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">ROI Dashboard</h1>
            <p className="text-sm text-muted-foreground">Quantified value and time savings from Shifty automation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last month</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" asChild>
            <Link href="/insights/roi/config">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Link>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-300">Total Saved</CardDescription>
            <CardTitle className="text-3xl text-emerald-400">{roiSummary.totalSaved}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-emerald-400">
              <DollarSign className="w-4 h-4" />
              Based on $150/hr engineering cost
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hours Saved</CardDescription>
            <CardTitle className="text-2xl">{roiSummary.hoursSaved.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Engineering hours
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tests Generated</CardDescription>
            <CardTitle className="text-2xl">{roiSummary.testsGenerated.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TestTube2 className="w-4 h-4" />
              AI-generated tests
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Selectors Healed</CardDescription>
            <CardTitle className="text-2xl">{roiSummary.selectorsHealed.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              Auto-healed selectors
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bugs Caught</CardDescription>
            <CardTitle className="text-2xl">{roiSummary.bugsCaught.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Bug className="w-4 h-4" />
              Before production
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Savings Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cumulative Savings</CardTitle>
            <CardDescription>Hours and cost savings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlySavings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#888" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) =>
                      name === "cost" ? [`$${value.toLocaleString()}`, "Cost Saved"] : [value, "Hours Saved"]
                    }
                  />
                  <Bar yAxisId="left" dataKey="hours" fill="#14b8a6" radius={[4, 4, 0, 0]} name="hours" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cost"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b" }}
                    name="cost"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Savings Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Savings by Category</CardTitle>
            <CardDescription>Where Shifty saves you time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savingsBreakdown.map((item) => {
                const Icon = item.icon
                const maxHours = Math.max(...savingsBreakdown.map((s) => s.hours))
                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: item.color }} />
                        <span className="text-sm font-medium">{item.category}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.hours} hrs | ${item.cost.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(item.hours / maxHours) * 100}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Before/After Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Before vs After Shifty</CardTitle>
          <CardDescription>Key metric improvements since adoption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {comparisonData.map((item) => {
              const improvementPercent =
                item.metric === "Test Coverage"
                  ? Math.round(((item.after - item.before) / item.before) * 100)
                  : Math.round(((item.before - item.after) / item.before) * 100)

              return (
                <div key={item.metric} className="p-4 bg-muted/50 rounded-lg text-center space-y-3">
                  <p className="text-xs text-muted-foreground font-medium">{item.metric}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg text-muted-foreground line-through">{item.before}</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xl font-semibold text-emerald-400">{item.after}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.unit}</p>
                  <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                    {improvementPercent > 0 ? "+" : ""}
                    {improvementPercent}%
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
