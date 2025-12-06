"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QualityGaugeProps {
  value: number
  label: string
  sublabel?: string
}

export function QualityGauge({ value, label, sublabel }: QualityGaugeProps) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (value / 100) * circumference

  const getColor = () => {
    if (value >= 90) return "stroke-chart-1"
    if (value >= 70) return "stroke-chart-3"
    return "stroke-destructive"
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-muted"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={getColor()}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-card-foreground">{value}%</span>
          </div>
        </div>
        {sublabel && <p className="text-xs text-muted-foreground mt-2 text-center">{sublabel}</p>}
      </CardContent>
    </Card>
  )
}
