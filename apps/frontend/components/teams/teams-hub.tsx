"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Star, Target, TrendingUp, TrendingDown, AlertTriangle, Filter } from "lucide-react"
import Link from "next/link"

const teams = [
  {
    id: "1",
    name: "Platform Core",
    slug: "platform-core",
    members: 12,
    projects: 4,
    maturityLevel: 4 as const,
    adoptionScore: 94,
    qualityScore: 91,
    xp: 28400,
    trend: 12,
    lead: "Alex Kim",
    attentionFlags: 0,
  },
  {
    id: "2",
    name: "Mobile Squad",
    slug: "mobile-squad",
    members: 8,
    projects: 2,
    maturityLevel: 4 as const,
    adoptionScore: 89,
    qualityScore: 87,
    xp: 24200,
    trend: 8,
    lead: "Jordan Lee",
    attentionFlags: 1,
  },
  {
    id: "3",
    name: "API Team",
    slug: "api-team",
    members: 10,
    projects: 3,
    maturityLevel: 3 as const,
    adoptionScore: 82,
    qualityScore: 84,
    xp: 19800,
    trend: 15,
    lead: "Casey Patel",
    attentionFlags: 0,
  },
  {
    id: "4",
    name: "Frontend Guild",
    slug: "frontend-guild",
    members: 9,
    projects: 5,
    maturityLevel: 3 as const,
    adoptionScore: 78,
    qualityScore: 79,
    xp: 18100,
    trend: -3,
    lead: "Morgan Chen",
    attentionFlags: 2,
  },
  {
    id: "5",
    name: "Data Engineering",
    slug: "data-engineering",
    members: 7,
    projects: 3,
    maturityLevel: 3 as const,
    adoptionScore: 71,
    qualityScore: 76,
    xp: 15600,
    trend: 6,
    lead: "Riley Santos",
    attentionFlags: 0,
  },
  {
    id: "6",
    name: "New Initiatives",
    slug: "new-initiatives",
    members: 5,
    projects: 2,
    maturityLevel: 1 as const,
    adoptionScore: 34,
    qualityScore: 45,
    xp: 4200,
    trend: 22,
    lead: "Sam Wilson",
    attentionFlags: 3,
  },
  {
    id: "7",
    name: "Legacy Support",
    slug: "legacy-support",
    members: 6,
    projects: 4,
    maturityLevel: 2 as const,
    adoptionScore: 52,
    qualityScore: 58,
    xp: 8900,
    trend: -8,
    lead: "Taylor Brown",
    attentionFlags: 2,
  },
  {
    id: "8",
    name: "DevOps Team",
    slug: "devops-team",
    members: 6,
    projects: 2,
    maturityLevel: 2 as const,
    adoptionScore: 61,
    qualityScore: 68,
    xp: 10200,
    trend: 4,
    lead: "Jamie Garcia",
    attentionFlags: 3,
  },
]

const maturityColors = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-teal-500",
  5: "bg-green-500",
}

const maturityLabels = {
  1: "Initial",
  2: "Managed",
  3: "Defined",
  4: "Quantified",
  5: "Optimizing",
}

export function TeamsHub() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("adoption")
  const [filterMaturity, setFilterMaturity] = useState("all")

  const filteredTeams = teams
    .filter((team) => {
      const matchesSearch = team.name.toLowerCase().includes(search.toLowerCase())
      const matchesMaturity = filterMaturity === "all" || team.maturityLevel.toString() === filterMaturity
      return matchesSearch && matchesMaturity
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "adoption":
          return b.adoptionScore - a.adoptionScore
        case "maturity":
          return b.maturityLevel - a.maturityLevel
        case "xp":
          return b.xp - a.xp
        case "attention":
          return b.attentionFlags - a.attentionFlags
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teams</h1>
          <p className="text-muted-foreground">Manage and monitor team quality engineering performance</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adoption">Adoption Score</SelectItem>
                <SelectItem value="maturity">Maturity Level</SelectItem>
                <SelectItem value="xp">Total XP</SelectItem>
                <SelectItem value="attention">Needs Attention</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMaturity} onValueChange={setFilterMaturity}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Maturity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Level 1 - Initial</SelectItem>
                <SelectItem value="2">Level 2 - Managed</SelectItem>
                <SelectItem value="3">Level 3 - Defined</SelectItem>
                <SelectItem value="4">Level 4 - Quantified</SelectItem>
                <SelectItem value="5">Level 5 - Optimizing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeams.map((team) => (
          <Link key={team.id} href={`/teams/${team.id}`}>
            <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-medium text-card-foreground">{team.name}</CardTitle>
                    <CardDescription className="text-xs">Lead: {team.lead}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {team.attentionFlags > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {team.attentionFlags}
                      </Badge>
                    )}
                    <div
                      className={`w-7 h-7 rounded-full ${maturityColors[team.maturityLevel]} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {team.maturityLevel}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{team.members} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>{team.projects} projects</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="w-3 h-3" />
                      <span>Adoption</span>
                    </div>
                    <span className="font-medium text-card-foreground">{team.adoptionScore}%</span>
                  </div>
                  <Progress value={team.adoptionScore} className="h-1.5" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-card-foreground">{team.xp.toLocaleString()} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {team.trend > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={team.trend > 0 ? "text-green-500" : "text-red-500"}>
                      {team.trend > 0 ? "+" : ""}
                      {team.trend}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
