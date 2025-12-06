"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trophy, Star, Zap, Target, Medal, Gift, Clock, Users, CheckCircle2, Lock, Play } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const userStats = {
  xp: 4850,
  level: 12,
  nextLevelXp: 5000,
  streak: 7,
  rank: 3,
  totalMissions: 156,
  badgesEarned: 18,
}

const missions = [
  {
    id: "1",
    title: "Label 10 UI Elements",
    type: "label",
    xpReward: 50,
    estimatedTime: "5 min",
    difficulty: "easy",
    claimed: false,
  },
  {
    id: "2",
    title: "Verify Healing Suggestions",
    type: "verify",
    xpReward: 100,
    estimatedTime: "10 min",
    difficulty: "medium",
    claimed: false,
  },
  {
    id: "3",
    title: "Triage Flaky Tests",
    type: "triage",
    xpReward: 150,
    badge: "Flake Hunter",
    estimatedTime: "15 min",
    difficulty: "hard",
    claimed: false,
  },
  {
    id: "4",
    title: "Review Test Generation",
    type: "verify",
    xpReward: 75,
    estimatedTime: "8 min",
    difficulty: "medium",
    claimed: true,
  },
]

const badges = [
  { id: "1", name: "First Blood", description: "Complete your first mission", earned: true, icon: Zap },
  { id: "2", name: "Streak Master", description: "7-day activity streak", earned: true, icon: Target },
  { id: "3", name: "Healer", description: "Verify 50 selector heals", earned: true, icon: Star },
  { id: "4", name: "Bug Crusher", description: "Triage 100 flaky tests", earned: false, progress: 67, icon: Trophy },
  { id: "5", name: "Label Legend", description: "Label 500 elements", earned: false, progress: 45, icon: Medal },
  { id: "6", name: "Team Player", description: "Help 10 teammates", earned: false, progress: 30, icon: Users },
]

const leaderboard = [
  { rank: 1, name: "Alex Rivera", xp: 8450, avatar: "/male-developer.png" },
  { rank: 2, name: "Jordan Lee", xp: 7890, avatar: "/female-engineer-working.png" },
  { rank: 3, name: "Sarah Chen", xp: 4850, avatar: "/asian-woman-professional.png", isCurrentUser: true },
  { rank: 4, name: "Mike Johnson", xp: 4200, avatar: "/male-programmer.jpg" },
  { rank: 5, name: "Emma Wilson", xp: 3980, avatar: "/female-developer.png" },
]

const rewards = [
  { id: "1", name: "Custom Theme", cost: 500, type: "cosmetic", available: true },
  { id: "2", name: "Priority Queue", cost: 1000, type: "feature", available: true },
  { id: "3", name: "Team Shoutout", cost: 2000, type: "recognition", available: false },
  { id: "4", name: "Swag Pack", cost: 5000, type: "physical", available: false },
]

export function ArcadeHub() {
  const router = useRouter()
  const [claimedMissions, setClaimedMissions] = useState<string[]>(["4"])

  const handleStartMission = (id: string) => {
    router.push(`/arcade/mission/${id}`)
  }

  const progressToNextLevel = ((userStats.xp % 500) / 500) * 100

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">HITL Arcade</h1>
          <p className="text-sm text-muted-foreground">Complete missions, earn XP, and help train the AI</p>
        </div>
      </div>

      {/* User Stats Banner */}
      <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-primary/30">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-primary">
                  <AvatarImage src="/asian-woman-professional.png" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {userStats.level}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Sarah Chen</h2>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>{userStats.xp.toLocaleString()} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="w-4 h-4 text-orange-400" />
                    <span>{userStats.streak} day streak</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Rank #{userStats.rank}</span>
                  </div>
                </div>
                <div className="mt-2 w-48">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Level {userStats.level}</span>
                    <span>Level {userStats.level + 1}</span>
                  </div>
                  <Progress value={progressToNextLevel} className="h-2" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8 text-center">
              <div>
                <p className="text-2xl font-bold">{userStats.totalMissions}</p>
                <p className="text-xs text-muted-foreground">Missions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{userStats.badgesEarned}</p>
                <p className="text-xs text-muted-foreground">Badges</p>
              </div>
              <div>
                <p className="text-2xl font-bold">#{userStats.rank}</p>
                <p className="text-xs text-muted-foreground">Rank</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="missions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="missions">Missions</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {missions.map((mission) => {
              const isClaimed = claimedMissions.includes(mission.id)
              return (
                <Card
                  key={mission.id}
                  className={isClaimed ? "opacity-60" : "hover:border-primary/50 transition-colors cursor-pointer"}
                  onClick={() => !isClaimed && handleStartMission(mission.id)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={
                              mission.difficulty === "easy"
                                ? "border-emerald-500 text-emerald-400"
                                : mission.difficulty === "medium"
                                  ? "border-amber-500 text-amber-400"
                                  : "border-red-500 text-red-400"
                            }
                          >
                            {mission.difficulty}
                          </Badge>
                          <Badge variant="secondary">{mission.type}</Badge>
                        </div>
                        <h3 className="font-medium">{mission.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400" />
                            <span>{mission.xpReward} XP</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{mission.estimatedTime}</span>
                          </div>
                        </div>
                        {mission.badge && (
                          <div className="mt-2 flex items-center gap-1 text-sm">
                            <Medal className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400">+{mission.badge} badge</span>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        disabled={isClaimed}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartMission(mission.id)
                        }}
                      >
                        {isClaimed ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Done
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {badges.map((badge) => {
              const Icon = badge.icon
              return (
                <Card key={badge.id} className={badge.earned ? "border-primary/50" : "opacity-70"}>
                  <CardContent className="py-6 text-center">
                    <div
                      className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${
                        badge.earned ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      {badge.earned ? (
                        <Icon className="w-8 h-8 text-primary" />
                      ) : (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-medium">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                    {!badge.earned && badge.progress !== undefined && (
                      <div className="mt-3">
                        <Progress value={badge.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{badge.progress}% complete</p>
                      </div>
                    )}
                    {badge.earned && <Badge className="mt-3 bg-primary/20 text-primary border-0">Earned</Badge>}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Leaderboard</CardTitle>
              <CardDescription>Top contributors this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user.isCurrentUser ? "bg-primary/10 border border-primary/30" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          user.rank === 1
                            ? "bg-amber-500 text-amber-950"
                            : user.rank === 2
                              ? "bg-gray-400 text-gray-900"
                              : user.rank === 3
                                ? "bg-orange-600 text-orange-100"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {user.rank}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        {user.isCurrentUser && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold">{user.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className={!reward.available ? "opacity-60" : ""}>
                <CardContent className="py-6 text-center">
                  <Gift
                    className={`w-10 h-10 mx-auto mb-3 ${reward.available ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <h3 className="font-medium">{reward.name}</h3>
                  <Badge variant="secondary" className="mt-2">
                    {reward.type}
                  </Badge>
                  <div className="mt-3 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold">{reward.cost.toLocaleString()}</span>
                  </div>
                  <Button size="sm" className="mt-3 w-full" disabled={!reward.available || userStats.xp < reward.cost}>
                    {userStats.xp >= reward.cost ? "Redeem" : "Not enough XP"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
