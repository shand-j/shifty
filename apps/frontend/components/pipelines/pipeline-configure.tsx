"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Plus, Trash2, GitBranch, Clock, Zap, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PipelineConfigure() {
  const [config, setConfig] = useState({
    name: "Main CI Pipeline",
    repo: "acme/web-app",
    branch: "main",
    autoHeal: true,
    autoGenerateTests: true,
    parallelism: 4,
    timeout: 30,
    retryOnFlake: true,
    maxRetries: 2,
    notifyOnFailure: true,
    notifyChannels: ["#engineering", "#qa"],
    testFilters: ["**/*.spec.ts", "**/*.test.ts"],
  })

  const [newChannel, setNewChannel] = useState("")
  const [newFilter, setNewFilter] = useState("")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/pipelines">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pipelines
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Pipeline Configuration</h1>
            <p className="text-sm text-muted-foreground">Configure CI pipeline settings and automation rules</p>
          </div>
        </div>
        <Button className="gap-2">
          <Save className="w-4 h-4" />
          Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Basic Settings
            </CardTitle>
            <CardDescription>Pipeline identification and source control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Pipeline Name</Label>
              <Input id="name" value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repo">Repository</Label>
              <Input id="repo" value={config.repo} onChange={(e) => setConfig({ ...config, repo: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Default Branch</Label>
              <Select value={config.branch} onValueChange={(v) => setConfig({ ...config, branch: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">main</SelectItem>
                  <SelectItem value="master">master</SelectItem>
                  <SelectItem value="develop">develop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Execution Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Execution Settings
            </CardTitle>
            <CardDescription>Performance and reliability options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parallelism">Parallelism</Label>
              <Select
                value={String(config.parallelism)}
                onValueChange={(v) => setConfig({ ...config, parallelism: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 worker</SelectItem>
                  <SelectItem value="2">2 workers</SelectItem>
                  <SelectItem value="4">4 workers</SelectItem>
                  <SelectItem value="8">8 workers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (minutes)</Label>
              <Input
                id="timeout"
                type="number"
                value={config.timeout}
                onChange={(e) => setConfig({ ...config, timeout: Number(e.target.value) })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="retryFlake">Retry on Flaky Failure</Label>
              <Switch
                id="retryFlake"
                checked={config.retryOnFlake}
                onCheckedChange={(v) => setConfig({ ...config, retryOnFlake: v })}
              />
            </div>

            {config.retryOnFlake && (
              <div className="space-y-2">
                <Label htmlFor="maxRetries">Max Retries</Label>
                <Select
                  value={String(config.maxRetries)}
                  onValueChange={(v) => setConfig({ ...config, maxRetries: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 retry</SelectItem>
                    <SelectItem value="2">2 retries</SelectItem>
                    <SelectItem value="3">3 retries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shifty Automation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Shifty Automation
            </CardTitle>
            <CardDescription>AI-powered healing and test generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoHeal">Auto-Heal Selectors</Label>
                <p className="text-xs text-muted-foreground">Automatically fix broken selectors</p>
              </div>
              <Switch
                id="autoHeal"
                checked={config.autoHeal}
                onCheckedChange={(v) => setConfig({ ...config, autoHeal: v })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoGenerate">Auto-Generate Tests</Label>
                <p className="text-xs text-muted-foreground">Generate tests for uncovered code</p>
              </div>
              <Switch
                id="autoGenerate"
                checked={config.autoGenerateTests}
                onCheckedChange={(v) => setConfig({ ...config, autoGenerateTests: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Notifications
            </CardTitle>
            <CardDescription>Alert channels for pipeline events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifyFail">Notify on Failure</Label>
              <Switch
                id="notifyFail"
                checked={config.notifyOnFailure}
                onCheckedChange={(v) => setConfig({ ...config, notifyOnFailure: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Notification Channels</Label>
              <div className="flex flex-wrap gap-2">
                {config.notifyChannels.map((channel) => (
                  <Badge key={channel} variant="secondary" className="gap-1">
                    {channel}
                    <button
                      onClick={() =>
                        setConfig({
                          ...config,
                          notifyChannels: config.notifyChannels.filter((c) => c !== channel),
                        })
                      }
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="#channel-name" value={newChannel} onChange={(e) => setNewChannel(e.target.value)} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newChannel && !config.notifyChannels.includes(newChannel)) {
                      setConfig({ ...config, notifyChannels: [...config.notifyChannels, newChannel] })
                      setNewChannel("")
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Filters */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Test File Filters</CardTitle>
            <CardDescription>Glob patterns to include test files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {config.testFilters.map((filter) => (
                <Badge key={filter} variant="outline" className="gap-1 font-mono">
                  {filter}
                  <button
                    onClick={() =>
                      setConfig({
                        ...config,
                        testFilters: config.testFilters.filter((f) => f !== filter),
                      })
                    }
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="**/*.spec.ts"
                className="font-mono"
                value={newFilter}
                onChange={(e) => setNewFilter(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (newFilter && !config.testFilters.includes(newFilter)) {
                    setConfig({ ...config, testFilters: [...config.testFilters, newFilter] })
                    setNewFilter("")
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
