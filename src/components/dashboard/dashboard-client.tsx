"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Badge } from "@/components/ui/badge"
import {
  CalendarDays, CheckCircle2, Clock, Loader2,
  User, Baby, Heart, DollarSign, TrendingDown, CircleDot,
  Map, ArrowRight, FileText,
} from "lucide-react"

type Applicant = { id: string; firstName: string; lastName: string; type: string }

type TaskAssignee = { id: string; applicant: Applicant }

type StageProgress = {
  id: string
  status: string
  progress: number
  startedAt: string | null
  completedAt: string | null
  startDate: string | null
  endDate: string | null
  duration: number | null
  stage: { id: string; code: string; name: string; order: number }
}

type TaskData = {
  id: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  completedDate: string | null
  taskType: string
  category: string | null
  estimatedCost: number | null
  actualCost: number | null
  paid: boolean
  currency: string
  assignees: TaskAssignee[]
}

type AppData = {
  id: string
  label: string
  status: string
  estimatedCompletionDate: string | null
  pathway: { name: string; visaCategory: string }
  applicants: Applicant[]
  stageProgress: StageProgress[]
}

interface DashboardClientProps { userName: string }

export function DashboardClient({ userName }: DashboardClientProps) {
  const [appData, setAppData] = useState<AppData | null>(null)
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/application").then(r => r.json()),
      fetch("/api/tasks").then(r => r.json()),
    ])
      .then(([app, taskList]) => {
        if (app.error) { setError(app.error); return }
        setAppData(app)
        setTasks(Array.isArray(taskList) ? taskList : [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-64"><p className="text-red-500">{error}</p></div>
  }

  if (!appData) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">No application data found.</p></div>
  }

  const overallProgress = appData.stageProgress.length > 0
    ? Math.round(appData.stageProgress.reduce((s, sp) => s + sp.progress, 0) / appData.stageProgress.length)
    : 0

  const completedStages = appData.stageProgress.filter(s => s.status === "COMPLETED").length
  const totalStages = appData.stageProgress.length

  const currentStage = appData.stageProgress.find(s => s.status === "IN_PROGRESS")
  const nextStage = currentStage
    ? appData.stageProgress.find(s => s.stage.order > currentStage.stage.order && s.status !== "COMPLETED")
    : appData.stageProgress.find(s => s.status !== "COMPLETED")
  const currentStageName = currentStage?.stage.name || nextStage?.stage.name || "Complete"

  const taskTotal = tasks.length
  const taskCompleted = tasks.filter(t => t.status === "COMPLETED").length
  const taskInProgress = tasks.filter(t => t.status === "IN_PROGRESS").length
  const taskBlocked = tasks.filter(t => t.status === "BLOCKED").length
  const taskPending = taskTotal - taskCompleted - taskInProgress - taskBlocked
  const taskProgress = taskTotal > 0 ? Math.round((taskCompleted / taskTotal) * 100) : 0

  const now = new Date()
  const upcomingDeadlines = tasks
    .filter(t => t.status !== "COMPLETED" && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  const recentlyCompleted = tasks
    .filter(t => t.status === "COMPLETED" && t.completedDate)
    .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())
    .slice(0, 5)

  const docTotal = tasks.filter(t => t.taskType === "DOCUMENT").length
  const docUploaded = tasks.filter(t => t.taskType === "DOCUMENT" && t.status === "COMPLETED").length

  const costsByCurrency = tasks.reduce((acc, t) => {
    const curr = t.currency || "CAD"
    if (!acc[curr]) acc[curr] = { estimated: 0, paid: 0 }
    if (t.estimatedCost) acc[curr].estimated += t.estimatedCost
    if (t.actualCost && t.paid) acc[curr].paid += t.actualCost
    return acc
  }, {} as Record<string, { estimated: number; paid: number }>)

  const totalEstimated = Object.values(costsByCurrency).reduce((s, c) => s + c.estimated, 0)
  const totalPaid = Object.values(costsByCurrency).reduce((s, c) => s + c.paid, 0)
  const familyCount = appData.applicants.length

  const stageStatusDot = (status: string, isCurrent: boolean) => {
    if (status === "COMPLETED") return <CheckCircle2 className="h-5 w-5 text-green-500" />
    if (isCurrent) return <CircleDot className="h-5 w-5 text-blue-500" />
    return <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
  }

  const priorityBadgeVariant: Record<string, "danger" | "warning" | "info" | "default"> = {
    CRITICAL: "danger", HIGH: "warning", MEDIUM: "info", LOW: "default",
  }

  const formatDate = (d: string | null) => {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {userName}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {appData.pathway.name} · {appData.label} · Started{" "}
            {new Date(appData.status === "PLANNING" ? Date.now() : Date.now()).toLocaleDateString("en-US", {
              month: "long", year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
            </div>
            <ProgressRing progress={overallProgress} size={64} strokeWidth={6} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>{completedStages}/{totalStages} stages</span>
            <span>{taskCompleted}/{taskTotal} tasks</span>
          </div>
          <ProgressBar progress={overallProgress} size="sm" className="mt-2" />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500">Current Stage</p>
              <p className="truncate text-lg font-semibold text-gray-900">{currentStageName}</p>
            </div>
            <div className="ml-3 rounded-full bg-purple-100 p-3 text-purple-600">
              <Map className="h-6 w-6" />
            </div>
          </div>
          {currentStage && <ProgressBar progress={currentStage.progress} size="sm" className="mt-3" />}
          {nextStage && nextStage !== currentStage && (
            <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
              Next: <span className="font-medium text-gray-600">{nextStage.stage.name}</span>
              <ArrowRight className="h-3 w-3" />
            </p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{taskCompleted}/{taskTotal}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>{taskInProgress} in progress</span>
            <span>{taskBlocked} blocked</span>
          </div>
          <ProgressBar progress={taskProgress} size="sm" className="mt-2" />
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
          <div className="mt-2 flex items-center gap-1.5">
            {appData.applicants.map(a => {
              const Icon = a.type === "SPOUSE" ? Heart : a.type === "CHILD" ? Baby : User
              return (
                <div key={a.id} className="flex items-center gap-1 text-xs text-gray-500">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="max-w-[80px] truncate">{a.firstName}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Stage Progress + Recent Activity */}
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardTitle>Stage Progress</CardTitle>
            <div className="mt-6 space-y-0">
              {appData.stageProgress.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-500">No stages found.</p>
              )}
              {appData.stageProgress.map((sp, i) => {
                const isCurrent = sp.stage.id === currentStage?.stage.id
                const isComplete = sp.status === "COMPLETED"
                const isLast = i === appData.stageProgress.length - 1
                return (
                  <div key={sp.id} className="relative flex gap-4 pb-8 last:pb-0">
                    {!isLast && (
                      <div className={`absolute left-4 top-8 h-full w-0.5 -translate-x-1/2 ${
                        isComplete ? "bg-green-500" : isCurrent ? "bg-blue-300" : "bg-gray-200 dark:bg-gray-700"
                      }`} />
                    )}
                    <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center">
                      {stageStatusDot(sp.status, isCurrent)}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${
                          isComplete ? "text-green-700 dark:text-green-400" : isCurrent ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                        }`}>{sp.stage.name}</span>
                        <Badge variant={isComplete ? "success" : isCurrent ? "info" : "outline"}>
                          {isComplete ? "Completed" : isCurrent ? "In Progress" : sp.status}
                        </Badge>
                      </div>
                      {(sp.startDate || sp.endDate) && (
                        <p className="mt-0.5 text-xs text-gray-400">
                          {sp.startDate ? new Date(sp.startDate).toLocaleDateString() : "—"} — {sp.endDate ? new Date(sp.endDate).toLocaleDateString() : "—"}
                        </p>
                      )}
                      {!isComplete && <ProgressBar progress={sp.progress} size="sm" className="mt-2" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card>
            <CardTitle>Recently Completed</CardTitle>
            {recentlyCompleted.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">No completed tasks yet.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {recentlyCompleted.map(t => (
                  <div key={t.id} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="flex-1 text-gray-900">{t.title}</span>
                    <span className="text-xs text-gray-400">{formatDate(t.completedDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Deadlines + Stats + Costs */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2.5 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingDeadlines.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Next Up</CardTitle>
            {upcomingDeadlines.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">No upcoming deadlines.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {upcomingDeadlines.map(t => (
                  <div key={t.id} className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{t.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(t.dueDate)}</p>
                    </div>
                    <Badge variant={priorityBadgeVariant[t.priority] || "default"} className="flex-shrink-0">
                      {t.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardTitle>Task Summary</CardTitle>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="flex-1 text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium text-gray-900">{taskCompleted}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="flex-1 text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-medium text-gray-900">{taskInProgress}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="flex-1 text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium text-gray-900">{taskPending}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="flex-1 text-sm text-gray-600">Blocked</span>
                <span className="text-sm font-medium text-gray-900">{taskBlocked}</span>
              </div>
              <hr className="border-gray-100 dark:border-gray-800" />
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="flex-1 text-sm text-gray-600">Documents</span>
                <span className="text-sm font-medium text-gray-900">{docUploaded}/{docTotal}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Cost Summary</CardTitle>
            <div className="mt-4 space-y-4">
              {Object.entries(costsByCurrency).length === 0 && (
                <p className="text-sm text-gray-500">No cost data available.</p>
              )}
              {Object.entries(costsByCurrency).map(([currency, costs]) => (
                <div key={currency}>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-1">
                    <span>{currency}</span><span>Estimated</span><span>Paid</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm font-medium">
                    <span className="text-gray-900">{currency}</span>
                    <span>${costs.estimated.toLocaleString()}</span>
                    <span className={costs.paid > 0 ? "text-green-600" : "text-gray-400"}>${costs.paid.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <TrendingDown className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-500">Remaining: ${(costs.estimated - costs.paid).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {Object.entries(costsByCurrency).length > 1 && (
                <div className="border-t pt-3">
                  <div className="grid grid-cols-3 gap-2 text-sm font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${totalEstimated.toLocaleString()}</span>
                    <span className="text-green-600">${totalPaid.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {appData.estimatedCompletionDate && (
            <Card>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Projected Timeline</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(appData.estimatedCompletionDate).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
