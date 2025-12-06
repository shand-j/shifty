"use client"

import { useState } from "react"
import { User, Building2, Bell, Key, Webhook, Users, Save, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import type { Persona } from "@/lib/types"

const personas: { value: Persona; label: string }[] = [
  { value: "qa", label: "QA Engineer" },
  { value: "dev", label: "Developer" },
  { value: "manager", label: "Manager" },
  { value: "po", label: "Product Owner" },
  { value: "designer", label: "Designer" },
  { value: "gtm", label: "GTM / Sales" },
]

const teamMembers = [
  { id: "1", name: "Sarah Chen", email: "sarah@acme.dev", role: "admin", persona: "qa" },
  { id: "2", name: "Mike Johnson", email: "mike@acme.dev", role: "member", persona: "dev" },
  { id: "3", name: "Emma Wilson", email: "emma@acme.dev", role: "member", persona: "manager" },
  { id: "4", name: "Alex Rivera", email: "alex@acme.dev", role: "viewer", persona: "po" },
]

const integrations = [
  { id: "github", name: "GitHub", connected: true, icon: "GH" },
  { id: "slack", name: "Slack", connected: true, icon: "SL" },
  { id: "jira", name: "Jira", connected: false, icon: "JI" },
  { id: "linear", name: "Linear", connected: false, icon: "LN" },
]

export function SettingsPage() {
  const { user, setUser } = useAppStore()
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState({
    ciFailures: true,
    healingRequired: true,
    roiAlerts: true,
    weeklyDigest: false,
    mentionNotifications: true,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePersonaChange = (persona: Persona) => {
    if (user) {
      setUser({ ...user, persona })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account, team, and integrations</p>
        </div>
        <Button onClick={handleSave}>
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="tenant" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Tenant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/asian-woman-professional.png" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Avatar</Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user?.name || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ""} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="persona">Default Persona</Label>
                <Select value={user?.persona} onValueChange={(v) => handlePersonaChange(v as Persona)}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {personas.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This controls your default dashboard view and navigation ordering
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>Customize your visual preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Reduce spacing in UI</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Team Members</CardTitle>
                <CardDescription>Manage your team access</CardDescription>
              </div>
              <Button size="sm">Invite Member</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`/.jpg?height=40&width=40&query=${member.name}`} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{member.persona}</Badge>
                      <Select defaultValue={member.role}>
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>CI Failures</Label>
                  <p className="text-sm text-muted-foreground">Get notified when pipelines fail</p>
                </div>
                <Switch
                  checked={notifications.ciFailures}
                  onCheckedChange={(v) => setNotifications({ ...notifications, ciFailures: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Healing Required</Label>
                  <p className="text-sm text-muted-foreground">When selectors need human review</p>
                </div>
                <Switch
                  checked={notifications.healingRequired}
                  onCheckedChange={(v) => setNotifications({ ...notifications, healingRequired: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>ROI Alerts</Label>
                  <p className="text-sm text-muted-foreground">Milestone achievements and savings</p>
                </div>
                <Switch
                  checked={notifications.roiAlerts}
                  onCheckedChange={(v) => setNotifications({ ...notifications, roiAlerts: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Summary of weekly activity</p>
                </div>
                <Switch
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(v) => setNotifications({ ...notifications, weeklyDigest: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mentions</Label>
                  <p className="text-sm text-muted-foreground">When someone mentions you</p>
                </div>
                <Switch
                  checked={notifications.mentionNotifications}
                  onCheckedChange={(v) => setNotifications({ ...notifications, mentionNotifications: v })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-mono text-sm font-bold">
                        {integration.icon}
                      </div>
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {integration.connected ? "Connected" : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <Button variant={integration.connected ? "outline" : "default"} size="sm">
                      {integration.connected ? "Configure" : "Connect"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Keys</CardTitle>
              <CardDescription>Manage API keys for SDK and CI integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Project API Key</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value="`sk_live_REDACTED`"
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline">Copy</Button>
                  <Button variant="outline">Regenerate</Button>
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">SDK Installation</p>
                <pre className="text-xs bg-background p-3 rounded-md overflow-x-auto">
                  {`npm install @shifty/sdk

// In your test setup
import { Shifty } from '@shifty/sdk'

const shifty = new Shifty({
  apiKey: process.env.SHIFTY_API_KEY
})`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tenant Settings</CardTitle>
              <CardDescription>Organization-wide configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input defaultValue="Acme Corp" />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input defaultValue="acme" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary" />
                  <Input defaultValue="#14b8a6" className="w-32 font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Default Test Framework</Label>
                <Select defaultValue="playwright">
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="playwright">Playwright</SelectItem>
                    <SelectItem value="cypress">Cypress</SelectItem>
                    <SelectItem value="jest">Jest</SelectItem>
                    <SelectItem value="vitest">Vitest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Healing Configuration</CardTitle>
              <CardDescription>Configure auto-healing behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-approve High Confidence</Label>
                  <p className="text-sm text-muted-foreground">Automatically apply heals with 95%+ confidence</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>Confidence Threshold</Label>
                <Select defaultValue="70">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="60">60%</SelectItem>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="80">80%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Heals below this threshold require manual review</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
