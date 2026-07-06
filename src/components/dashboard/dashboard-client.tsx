"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2, Clock, Trophy, Target, Sparkles, Loader2, User, Baby, Heart,
} from "lucide-react"

interface DashboardClientProps { userName: string }

type AppData = {
  id: string; label: string; status: string; crsScore: number; targetCrsScore: number
  healthScore: number; readinessScore: number
  createdAt: string
  pathway: { name: string; visaCategory: string }
  applicants: Array<{ id: string; firstName: string; lastName: string; type: string }>
  stageProgress: Array<{
    id: string; status: string; progress: number
    stage: { id: string; code: string; name: string; order: number }
  }>
  taskInstances: Array<{ id: string; title: string; status: string; priority: string; dueDate: string | null }>
}

export function DashboardClient({ userName }: DashboardClientProps) {
  const [data, setData] = useState<AppData | null>(null)
  const [tasks, setTasks] = useState<Array<{ id: string; title: string; status: string; priority: string; dueDate: string | null; applicant: { firstName: string } | null }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/application").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
    ]).then(([app, t]) => {
      setData(app)
      setTasks(t)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
  if (!data) return <p className="text-red-500">No application data found.</p>

  const overallProgress = data.stageProgress.length > 0
    ? Math.round(data.stageProgress.reduce((s, sp) => s + sp.progress, 0) / data.stageProgress.length)
    : 0
  const completedStages = data.stageProgress.filter((s) => s.status === "COMPLETED").length
  const totalStages = data.stageProgress.length

  const taskCompleted = tasks.filter((t) => t.status === "COMPLETED").length
  const taskTotal = tasks.length
  const taskProgress = taskTotal > 0 ? Math.round((taskCompleted / taskTotal) * 100) : 0

  const currentStage = data.stageProgress.find((s) => s.status === "IN_PROGRESS")
  const currentStageName = currentStage?.stage.name || "Not started"

  const dueSoon = tasks.filter((t) => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) <= new Date(Date.now() + 14 * 86400000)).slice(0, 5)
  const familyCount = data.applicants.length

  const statusColors: Record<string, string> = {
    COMPLETED: "bg-green-500", IN_PROGRESS: "bg-blue-500", LOCKED: "bg-gray-300", UNLOCKED: "bg-yellow-500",
  }
  const statusLabels: Record<string, string> = {
    COMPLETED: "Completed", IN_PROGRESS: "In Progress", LOCKED: "Locked", UNLOCKED: "Unlocked",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {userName}</h1>
        <p className="mt-1 text-gray-500">{data.pathway.name} · Started {new Date(data.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
            </div>
            <ProgressRing progress={overallProgress} size={64} strokeWidth={6} />
          </div>
          <ProgressBar progress={overallProgress} size="sm" className="mt-3" />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{taskCompleted}/{taskTotal}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <Trophy className="h-6 w-6" />
            </div>
          </div>
          <ProgressBar progress={taskProgress} size="sm" className="mt-3" />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Stage</p>
              <p className="text-lg font-semibold text-gray-900">{currentStageName}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 text-purple-600">
              <Target className="h-6 w-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{completedStages}/{totalStages} stages done</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Family</p>
              <p className="text-2xl font-bold text-gray-900">{familyCount}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <Heart className="h-6 w-6" />
            </div>
          </div>
            <div className="mt-2 flex gap-1">
            {data.applicants.map((a) => {
              const Icon = a.type === "SPOUSE" ? Heart : a.type === "CHILD" ? Baby : User
              return <Icon key={a.id} className="h-4 w-4 text-gray-500" data-tip={`${a.firstName} (${a.type})`} />
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Due Soon */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Tasks</CardTitle>
              <Badge variant="warning">{dueSoon.length} due soon</Badge>
            </div>
            <div className="mt-4 space-y-2">
              {dueSoon.length === 0 && (
                <p className="text-sm text-gray-500 py-4 text-center">No upcoming deadlines. Add some tasks!</p>
              )}
              {dueSoon.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                  <div className={`h-3 w-3 rounded-full ${statusColors[t.status] || "bg-gray-300"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                    <p className="text-xs text-gray-500">
                      Due {new Date(t.dueDate!).toLocaleDateString()}
                      {t.applicant && ` · ${t.applicant.firstName}`}
                    </p>
                  </div>
                  <Badge variant={t.priority === "CRITICAL" ? "danger" : t.priority === "HIGH" ? "warning" : "info"}>
                    {t.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Stage Progress */}
          <Card>
            <CardTitle>Journey Progress</CardTitle>
            <div className="mt-4 space-y-3">
              {data.stageProgress.map((sp, i) => {
                const isCurrent = sp.stage.id === currentStage?.stage.id
                const isComplete = sp.status === "COMPLETED"
                return (
                  <div key={sp.id} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                        isComplete ? "bg-green-500 text-white" :
                        isCurrent ? "bg-blue-500 text-white ring-2 ring-blue-300" :
                        "bg-gray-200 text-gray-500 dark:bg-gray-700"
                      }`}>
                        {isComplete ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                      </div>
                      {i < data.stageProgress.length - 1 && (
                        <div className={`mt-1 h-6 w-0.5 ${isComplete ? "bg-green-500" : isCurrent ? "bg-blue-300" : "bg-gray-300 dark:bg-gray-600"}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isCurrent ? "text-blue-700" : "text-gray-900 dark:text-gray-100"}`}>
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
          {/* Summary */}
          <Card>
            <CardTitle>Quick Summary</CardTitle>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Stages Completed</span>
                <span className="font-medium">{completedStages}/{totalStages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tasks Done</span>
                <span className="font-medium">{taskCompleted}/{taskTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Family Members</span>
                <span className="font-medium">{familyCount}</span>
              </div>
              {data.crsScore > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">CRS Score</span>
                  <span className="font-medium">{data.crsScore}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Stage Status */}
          <Card>
            <CardTitle>Stage Status</CardTitle>
            <div className="mt-3 space-y-3">
              {["COMPLETED", "IN_PROGRESS", "UNLOCKED", "LOCKED"].map((s) => {
                const count = data.stageProgress.filter((sp) => sp.status === s).length
                if (count === 0) return null
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${statusColors[s]}`} />
                    <span className="flex-1 text-sm text-gray-600">{statusLabels[s]}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* AI Coach prompt */}
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">AI Coach</p>
                <p className="mt-1 text-sm text-blue-700">
                  Add tasks, track progress, and check the timeline to stay on schedule with your Express Entry journey.
                </p>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.href = "/app/coach"}>
                  Ask AI Coach
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
