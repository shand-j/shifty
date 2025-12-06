"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, DollarSign, Clock, Save, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ROIConfig() {
  const [config, setConfig] = useState({
    engineeringHourlyRate: 150,
    qaHourlyRate: 100,
    currency: "USD",
    avgTestWriteTime: 45,
    avgBugFixTime: 120,
    avgSelectorHealTime: 15,
    avgTriageTime: 30,
    includeBenefits: true,
    benefitsMultiplier: 1.3,
    ciCostPerMinute: 0.05,
    monthlyQAToolsCost: 500,
    includeOpportunityCost: true,
  })

  const handleSave = () => {
    // Save config
    console.log("Saving config:", config)
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/insights/roi">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to ROI Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">ROI Configuration</h1>
              <p className="text-sm text-muted-foreground">Configure cost parameters for accurate ROI calculations</p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Configuration
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Labor Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Labor Costs
              </CardTitle>
              <CardDescription>Configure hourly rates for accurate savings calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Currency for all cost calculations</TooltipContent>
                  </Tooltip>
                </div>
                <Select value={config.currency} onValueChange={(v) => setConfig({ ...config, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="engRate">Engineering Hourly Rate</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Fully loaded cost per hour for software engineers</TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="engRate"
                    type="number"
                    value={config.engineeringHourlyRate}
                    onChange={(e) => setConfig({ ...config, engineeringHourlyRate: Number(e.target.value) })}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="qaRate">QA Hourly Rate</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Fully loaded cost per hour for QA engineers</TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="qaRate"
                    type="number"
                    value={config.qaHourlyRate}
                    onChange={(e) => setConfig({ ...config, qaHourlyRate: Number(e.target.value) })}
                    className="pl-9"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="benefits">Include Benefits Multiplier</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Add benefits/overhead costs (typically 1.2-1.5x base salary)</TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  id="benefits"
                  checked={config.includeBenefits}
                  onCheckedChange={(v) => setConfig({ ...config, includeBenefits: v })}
                />
              </div>

              {config.includeBenefits && (
                <div className="space-y-2">
                  <Label htmlFor="multiplier">Benefits Multiplier</Label>
                  <Input
                    id="multiplier"
                    type="number"
                    step="0.1"
                    value={config.benefitsMultiplier}
                    onChange={(e) => setConfig({ ...config, benefitsMultiplier: Number(e.target.value) })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Estimates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Estimates
              </CardTitle>
              <CardDescription>Average time for manual tasks (in minutes)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="testWrite">Avg. Test Writing Time</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Average minutes to write a single test manually</TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    id="testWrite"
                    type="number"
                    value={config.avgTestWriteTime}
                    onChange={(e) => setConfig({ ...config, avgTestWriteTime: Number(e.target.value) })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">min</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="bugFix">Avg. Bug Fix Time</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Average minutes to fix a bug found in production</TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    id="bugFix"
                    type="number"
                    value={config.avgBugFixTime}
                    onChange={(e) => setConfig({ ...config, avgBugFixTime: Number(e.target.value) })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">min</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="selectorHeal">Avg. Selector Fix Time</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Average minutes to manually fix a broken selector</TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    id="selectorHeal"
                    type="number"
                    value={config.avgSelectorHealTime}
                    onChange={(e) => setConfig({ ...config, avgSelectorHealTime: Number(e.target.value) })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">min</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="triage">Avg. Triage Time</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Average minutes to triage and classify a test failure</TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    id="triage"
                    type="number"
                    value={config.avgTriageTime}
                    onChange={(e) => setConfig({ ...config, avgTriageTime: Number(e.target.value) })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Infrastructure Costs</CardTitle>
              <CardDescription>CI/CD and tooling costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="ciCost">CI Cost per Minute</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Cost per minute of CI pipeline execution</TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="ciCost"
                    type="number"
                    step="0.01"
                    value={config.ciCostPerMinute}
                    onChange={(e) => setConfig({ ...config, ciCostPerMinute: Number(e.target.value) })}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="toolsCost">Monthly QA Tools Cost</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Monthly cost for QA tools and services</TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="toolsCost"
                    type="number"
                    value={config.monthlyQAToolsCost}
                    onChange={(e) => setConfig({ ...config, monthlyQAToolsCost: Number(e.target.value) })}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advanced Settings</CardTitle>
              <CardDescription>Additional ROI calculation options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="opportunity">Include Opportunity Cost</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Include cost of features not built due to QA work</TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  id="opportunity"
                  checked={config.includeOpportunityCost}
                  onCheckedChange={(v) => setConfig({ ...config, includeOpportunityCost: v })}
                />
              </div>

              <Separator />

              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Current Effective Rates</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    Engineering: $
                    {config.engineeringHourlyRate * (config.includeBenefits ? config.benefitsMultiplier : 1)}/hr
                  </p>
                  <p>QA: ${config.qaHourlyRate * (config.includeBenefits ? config.benefitsMultiplier : 1)}/hr</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
