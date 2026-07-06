"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { calculateCRS, identifyOpportunities } from "@/lib/crs-engine"
import { evaluateJourney, computeHealthScore } from "@/lib/journey-engine"
import {
  ArrowRight, AlertCircle, CheckCircle2, Clock, Trophy, TrendingUp, Target, Sparkles, FileText, Loader2,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts"

interface DashboardClientProps {
  userName: string
}

type StageProgress = {
  id: string
  status: string
  progress: number
  stage: { id: string; code: string; name: string; order: number; estimatedDurationDays: number | null }
  startedAt: string | null
  completedAt: string | null
}

type TaskInstance = {
  id: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  estimatedTimeMinutes: number
}

type CRSSnapshot = {
  totalScore: number
  breakdown: Record<string, unknown> | null
}

type ApplicationData = {
  id: string
  label: string
  status: string
  crsScore: number
  targetCrsScore: number
  healthScore: number
  readinessScore: number
  currentStageId: string | null
  estimatedCompletionDate: string | null
  daysRemaining: number
  journeyVelocity: number
  createdAt: string
  pathway: { name: string; visaCategory: string }
  applicants: Array<{ id: string; firstName: string; lastName: string; type: string }>
  stageProgress: StageProgress[]
  taskInstances: TaskInstance[]
  crsSnapshots: CRSSnapshot[]
}

export function DashboardClient({ userName }: DashboardClientProps) {
  const [app, setApp] = useState<ApplicationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/application")
      .then((r) => r.json())
      .then(setApp)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }
  if (!app) return <p className="text-red-500">No application data found. Run the seed script.</p>

  const overallProgress = app.stageProgress.length > 0
    ? Math.round(app.stageProgress.reduce((s, sp) => s + sp.progress, 0) / app.stageProgress.length)
    : 0

  const currentStage = app.stageProgress.find((s) => s.status === "IN_PROGRESS")
  const currentStageObj = currentStage || app.stageProgress.find((s) => s.status === "UNLOCKED") || app.stageProgress[0]
  const currentStageName = currentStageObj?.stage?.name || "N/A"
  const currentStageProgress = currentStageObj?.progress || 0

  const completedStages = app.stageProgress.filter((s) => s.status === "COMPLETED").length
  const totalStages = app.stageProgress.length

  const todayTasks = app.taskInstances.filter((t) => t.status !== "COMPLETED").slice(0, 5)
  const crsSnapshot = app.crsSnapshots?.[0]
  const crsScore = crsSnapshot?.totalScore ?? app.crsScore ?? 0
  const targetScore = app.targetCrsScore || 470
  const gap = targetScore - crsScore

  const docUploaded = app.stageProgress.filter((s) => ["COMPLETED", "IN_PROGRESS"].includes(s.status)).length

  const statusLabels: Record<string, string> = {
    COMPLETED: "Completed", IN_PROGRESS: "In Progress", UNLOCKED: "Unlocked", LOCKED: "Locked",
  }
  const statusColors: Record<string, string> = {
    COMPLETED: "bg-green-500", IN_PROGRESS: "bg-blue-500", UNLOCKED: "bg-yellow-500", LOCKED: "bg-gray-300",
  }
  const priorityColors: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-700", HIGH: "bg-orange-100 text-orange-700",
    MEDIUM: "bg-blue-100 text-blue-700", LOW: "bg-gray-100 text-gray-700",
  }
  const priorityBadge: Record<string, "danger" | "warning" | "info" | "outline"> = {
    CRITICAL: "danger", HIGH: "warning", MEDIUM: "info", LOW: "outline",
  }

  const health = computeHealthScore({
    overdueCriticalTasks: 0, overdueHighTasks: 0, expiredDocuments: 0, expiringDocuments: 0,
    crsBelowTarget: gap, stagnationDays: 0, missingCriticalDocs: 0, blockedTasksUnresolved: 0,
    aheadOfSchedule: false, consecutiveWeeklyProgress: 1, allNonDependentTasksComplete: false,
  })

  const healthColor = health.status === "EXCELLENT" ? "text-green-600" : health.status === "GOOD" ? "text-blue-600" : health.status === "AT_RISK" ? "text-yellow-600" : "text-red-600"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {userName}</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          {app.pathway.name} &middot; Started {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overallProgress}%</p>
            </div>
            <ProgressRing progress={overallProgress} size={64} strokeWidth={6} />
          </div>
          <ProgressBar progress={overallProgress} size="sm" className="mt-3" />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Health Score</p>
              <p className={`text-2xl font-bold ${healthColor}`}>{health.score}</p>
            </div>
            <div className={`rounded-full p-3 ${
              health.status === "EXCELLENT" ? "bg-green-100 text-green-600" :
              health.status === "GOOD" ? "bg-blue-100 text-blue-600" : "bg-yellow-100 text-yellow-600"
            }`}>
              <Trophy className="h-6 w-6" />
            </div>
          </div>
          <Badge variant={health.status === "EXCELLENT" ? "success" : health.status === "GOOD" ? "info" : "warning"} className="mt-2">
            {health.status.charAt(0) + health.status.slice(1).toLowerCase()}
          </Badge>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Stage</p>
              <p className="text-lg font-semibold text-gray-900">{currentStageName}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <Target className="h-6 w-6" />
            </div>
          </div>
          <ProgressBar progress={currentStageProgress} size="sm" className="mt-3" />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-lg font-semibold text-gray-900">{completedStages}/{totalStages} stages</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">{Math.round((completedStages / totalStages) * 100)}% complete</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Today's Tasks */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>Tasks</CardTitle>
              <Badge variant="warning">{todayTasks.length} pending</Badge>
            </div>
            <div className="mt-4 space-y-2">
              {todayTasks.length === 0 && (
                <p className="text-sm text-gray-500 py-4 text-center">No pending tasks. Great work!</p>
              )}
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                  <div className={`h-3 w-3 rounded-full ${statusColors[task.status] || "bg-gray-300"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority] || ""}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Journey Progress */}
          <Card>
            <CardTitle>Journey Progress</CardTitle>
            <div className="mt-4 space-y-3">
              {app.stageProgress.map((sp, i) => {
                const isCurrent = sp.stage.id === currentStage?.stage?.id
                const isComplete = sp.status === "COMPLETED"
                return (
                  <div key={sp.id} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                        isComplete ? "bg-green-500 text-white" :
                        isCurrent ? "bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-2 dark:ring-offset-gray-900" :
                        "bg-gray-200 text-gray-500 dark:bg-gray-700"
                      }`}>
                        {isComplete ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                      </div>
                      {i < app.stageProgress.length - 1 && (
                        <div className={`mt-1 h-6 w-0.5 ${isComplete ? "bg-green-500" : isCurrent ? "bg-blue-300" : "bg-gray-300 dark:bg-gray-600"}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isCurrent ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-gray-100"}`}>
                        {sp.stage.name}
                        {isCurrent && <Badge variant="info" className="ml-2">In Progress</Badge>}
                      </p>
                      <p className="text-xs text-gray-500">{statusLabels[sp.status] || sp.status}</p>
                      <ProgressBar progress={sp.progress} size="sm" className="mt-1" />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* CRS Score */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>CRS Score</CardTitle>
              <Badge variant="warning">{crsScore} / {targetScore}</Badge>
            </div>
            <div className="mt-4 text-center">
              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{crsScore}</p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <p className="text-sm text-gray-500">Target: {targetScore}+</p>
                {gap > 0 && <span className="text-sm font-medium text-red-500">Gap: {gap}</span>}
              </div>
              <ProgressBar progress={(crsScore / targetScore) * 100} size="sm" className="mt-2" barClassName="bg-orange-500" />
            </div>
          </Card>

          {/* Stage Status Summary */}
          <Card>
            <CardTitle>Stage Status</CardTitle>
            <div className="mt-3 space-y-3">
              {["COMPLETED", "IN_PROGRESS", "UNLOCKED", "LOCKED"].map((s) => {
                const count = app.stageProgress.filter((sp) => sp.status === s).length
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${statusColors[s]}`} />
                    <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">{statusLabels[s]}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Documents */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>Documents</CardTitle>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Stages with progress</span>
                <span className="font-medium text-green-600">{docUploaded}/{totalStages}</span>
              </div>
              <ProgressBar progress={(docUploaded / totalStages) * 100} size="sm" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
