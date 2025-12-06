"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Star, Clock, Trophy, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LabelingTask } from "./workflows/labeling-task"
import { VerifyHealingTask } from "./workflows/verify-healing-task"
import { TriageTask } from "./workflows/triage-task"

interface Mission {
  id: string
  title: string
  type: "label" | "verify" | "triage"
  xpReward: number
  badge?: string
  estimatedTime: string
  difficulty: "easy" | "medium" | "hard"
  totalTasks: number
}

const missions: Record<string, Mission> = {
  "1": {
    id: "1",
    title: "Label 10 UI Elements",
    type: "label",
    xpReward: 50,
    estimatedTime: "5 min",
    difficulty: "easy",
    totalTasks: 10,
  },
  "2": {
    id: "2",
    title: "Verify Healing Suggestions",
    type: "verify",
    xpReward: 100,
    estimatedTime: "10 min",
    difficulty: "medium",
    totalTasks: 5,
  },
  "3": {
    id: "3",
    title: "Triage Flaky Tests",
    type: "triage",
    xpReward: 150,
    badge: "Flake Hunter",
    estimatedTime: "15 min",
    difficulty: "hard",
    totalTasks: 5,
  },
}

interface MissionWorkflowProps {
  missionId: string
}

export function MissionWorkflow({ missionId }: MissionWorkflowProps) {
  const router = useRouter()
  const mission = missions[missionId]
  const [currentTask, setCurrentTask] = useState(0)
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [skippedTasks, setSkippedTasks] = useState<number[]>([])
  const [earnedXp, setEarnedXp] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  if (!mission) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Mission not found</p>
        <Button variant="outline" className="mt-4 bg-transparent" onClick={() => router.push("/arcade")}>
          Back to Arcade
        </Button>
      </div>
    )
  }

  const handleTaskComplete = (correct: boolean) => {
    if (correct) {
      setCompletedTasks([...completedTasks, currentTask])
      const taskXp = Math.floor(mission.xpReward / mission.totalTasks)
      setEarnedXp(earnedXp + taskXp)
    }

    if (currentTask + 1 >= mission.totalTasks) {
      setIsComplete(true)
    } else {
      setCurrentTask(currentTask + 1)
    }
  }

  const handleSkip = () => {
    setSkippedTasks([...skippedTasks, currentTask])
    if (currentTask + 1 >= mission.totalTasks) {
      setIsComplete(true)
    } else {
      setCurrentTask(currentTask + 1)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((completedTasks.length + skippedTasks.length) / mission.totalTasks) * 100

  if (isComplete) {
    const accuracy = mission.totalTasks > 0 ? Math.round((completedTasks.length / mission.totalTasks) * 100) : 0
    const bonusXp = accuracy === 100 ? 25 : accuracy >= 80 ? 10 : 0
    const totalXp = earnedXp + bonusXp

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="border-primary/50 bg-gradient-to-b from-primary/10 to-transparent">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-6">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Mission Complete!</h1>
            <p className="text-muted-foreground mb-8">{mission.title}</p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {completedTasks.length}/{mission.totalTasks}
                </p>
                <p className="text-sm text-muted-foreground">Tasks Correct</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{formatTime(elapsedTime)}</p>
                <p className="text-sm text-muted-foreground">Time</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-2 text-xl font-bold mb-2">
                <Star className="w-6 h-6 text-amber-400" />
                <span>+{totalXp} XP</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Base XP: +{earnedXp}</p>
                {bonusXp > 0 && <p className="text-emerald-400">Accuracy Bonus: +{bonusXp}</p>}
              </div>
              {mission.badge && accuracy >= 80 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400 font-medium">Badge Earned: {mission.badge}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/arcade")}>
                Back to Arcade
              </Button>
              <Button onClick={() => router.push("/arcade")}>
                Next Mission
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/arcade")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{mission.title}</h1>
            <div className="flex items-center gap-3 mt-1">
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
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400" />
                {mission.xpReward} XP
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-mono font-medium flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(elapsedTime)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Earned</p>
            <p className="font-medium flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400" />
              {earnedXp} XP
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Task {currentTask + 1} of {mission.totalTasks}
            </span>
            <span className="text-sm text-muted-foreground">
              {completedTasks.length} correct, {skippedTasks.length} skipped
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Task Content */}
      <div className="min-h-[500px]">
        {mission.type === "label" && (
          <LabelingTask taskIndex={currentTask} onComplete={handleTaskComplete} onSkip={handleSkip} />
        )}
        {mission.type === "verify" && (
          <VerifyHealingTask taskIndex={currentTask} onComplete={handleTaskComplete} onSkip={handleSkip} />
        )}
        {mission.type === "triage" && (
          <TriageTask taskIndex={currentTask} onComplete={handleTaskComplete} onSkip={handleSkip} />
        )}
      </div>
    </div>
  )
}
