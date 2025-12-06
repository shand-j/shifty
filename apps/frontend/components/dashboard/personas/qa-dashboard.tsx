"use client"

import { StatCard } from "../widgets/stat-card"
import { QualityGauge } from "../widgets/quality-gauge"
import { TestStatusTable } from "../widgets/test-status-table"
import { HealingQueuePreview } from "../widgets/healing-queue-preview"
import { ActivityFeed } from "../widgets/activity-feed"
import { MiniChart } from "../widgets/mini-chart"
import { PlayCircle, Sparkles, AlertTriangle, Clock } from "lucide-react"

const passRateData = [
  { name: "Mon", value: 92 },
  { name: "Tue", value: 94 },
  { name: "Wed", value: 91 },
  { name: "Thu", value: 96 },
  { name: "Fri", value: 93 },
  { name: "Sat", value: 95 },
  { name: "Sun", value: 97 },
]

export function QADashboard() {
  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Sessions" value={3} icon={<PlayCircle className="w-4 h-4" />} />
        <StatCard
          title="Pending Heals"
          value={12}
          change={-8}
          changeLabel="vs last week"
          icon={<Sparkles className="w-4 h-4" />}
        />
        <StatCard
          title="Flaky Tests"
          value={7}
          change={-15}
          changeLabel="vs last week"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <StatCard
          title="Avg Heal Time"
          value="2.4s"
          change={12}
          changeLabel="faster"
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TestStatusTable />
          <HealingQueuePreview />
        </div>
        <div className="space-y-6">
          <QualityGauge value={94} label="Quality Score" sublabel="Pass rate over last 7 days" />
          <MiniChart title="Pass Rate Trend" data={passRateData} color="#22c55e" valueSuffix="%" />
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
