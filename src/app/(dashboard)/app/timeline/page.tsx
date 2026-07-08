"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/progress-bar"
import { CalendarDays, CheckCircle2, Loader2, ArrowRight, Clock } from "lucide-react"

type StageData = {
  id: string
  status: string
  progress: number
  startedAt: string | null
  completedAt: string | null
  startDate: string | null
  endDate: string | null
  duration: number | null
  stage: { id: string; code: string; name: string; order: number; description: string | null }
  groups: {
    id: string
    name: string
    tasks: {
      id: string
      title: string
      status: string
      priority: string
      dueDate: string | null
      completedDate: string | null
      plannedDate: string | null
    }[]
  }[]
}

export default function TimelinePage() {
  const [stages, setStages] = useState<StageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/stages?include=tasks")
      .then(r => r.json())
      .then(data => {
        if (data?.error) { setError(data.error); return }
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setStages(Array.isArray(data.stages) ? data.stages : [])
        } else {
          setStages(Array.isArray(data) ? data : [])
        }
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

  const allTasks = stages.flatMap(s => (s.groups || []).flatMap(g => g.tasks))
  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter(t => t.status === "COMPLETED").length
  const inProgressTasks = allTasks.filter(t => t.status === "IN_PROGRESS").length

  const statusVariant: Record<string, "success" | "info" | "warning" | "danger" | "outline"> = {
    COMPLETED: "success", IN_PROGRESS: "info", NOT_STARTED: "outline", WAITING: "warning", BLOCKED: "danger",
  }

  const priorityBadge: Record<string, "danger" | "warning" | "info" | "outline"> = {
    CRITICAL: "danger", HIGH: "warning", MEDIUM: "info", LOW: "outline",
  }

  const stageStatusDot = (status: string, isCurrent: boolean) => {
    if (status === "COMPLETED") return <CheckCircle2 className="h-5 w-5 text-green-500" />
    if (isCurrent) return <div className="h-5 w-5 rounded-full bg-blue-500" />
    if (status === "UNLOCKED") return <div className="h-5 w-5 rounded-full border-2 border-yellow-400" />
    return <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
  }

  const currentStage = stages.find(s => s.status === "IN_PROGRESS")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Timeline</h1>
        <p className="mt-1 text-sm text-gray-500">
          Stage timelines with task milestones
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-gray-500">Stages</p><p className="text-2xl font-bold text-gray-900">{stages.length}</p></Card>
        <Card><p className="text-sm text-gray-500">Completed Tasks</p><p className="text-2xl font-bold text-green-600">{completedTasks}/{totalTasks}</p></Card>
        <Card><p className="text-sm text-gray-500">In Progress</p><p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p></Card>
      </div>

      {stages.length === 0 && (
        <Card><p className="py-4 text-center text-sm text-gray-500">No timeline data available.</p></Card>
      )}

      <div className="space-y-0">
        {stages.map((s, idx) => {
          const isCurrent = s.id === currentStage?.id
          const isLast = idx === stages.length - 1
          const stageTasks = (s.groups || []).flatMap(g => g.tasks)
          const stageDone = stageTasks.filter(t => t.status === "COMPLETED").length

          return (
            <div key={s.id} className="relative flex gap-4 pb-8 last:pb-0">
              {!isLast && (
                <div className={`absolute left-4 top-8 h-full w-0.5 -translate-x-1/2 ${
                  s.status === "COMPLETED" ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                }`} />
              )}
              <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center">
                {stageStatusDot(s.status, isCurrent)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-base font-semibold ${
                    s.status === "COMPLETED" ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-gray-100"
                  }`}>{s.stage.name}</span>
                  <Badge variant={statusVariant[s.status] || "outline"}>
                    {s.status === "IN_PROGRESS" ? "In Progress" : s.status}
                  </Badge>
                </div>

                {/* Timeline Dates */}
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>{s.startDate ? new Date(s.startDate).toLocaleDateString() : "—"}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>{s.endDate ? new Date(s.endDate).toLocaleDateString() : "—"}</span>
                  {s.duration && (
                    <>
                      <span className="text-gray-300">|</span>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{s.duration} days</span>
                    </>
                  )}
                </div>

                {/* Stage Progress */}
                {stageTasks.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-400">{stageDone}/{stageTasks.length} tasks</span>
                    <ProgressBar
                      progress={stageTasks.length > 0 ? (stageDone / stageTasks.length) * 100 : 0}
                      size="sm" className="w-32"
                    />
                  </div>
                )}

                {/* Tasks as milestones */}
                {stageTasks.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {stageTasks.map(t => (
                      <div key={t.id} className="flex items-center gap-2 pl-2">
                        <div className={`h-2 w-2 rounded-full ${
                          t.status === "COMPLETED" ? "bg-green-500" : t.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-gray-300"
                        }`} />
                        <span className={`text-xs ${t.status === "COMPLETED" ? "line-through text-gray-400" : "text-gray-600 dark:text-gray-400"}`}>
                          {t.title}
                        </span>
                        {t.priority === "CRITICAL" && t.status !== "COMPLETED" && (
                          <Badge variant="danger" className="text-[10px]">Critical</Badge>
                        )}
                        {t.dueDate && (
                          <span className="text-[10px] text-gray-400">
                            {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Groups */}
                {(s.groups || []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(s.groups || []).map(g => (
                      <Badge key={g.id} variant="outline" className="text-[10px]">
                        {g.name} ({g.tasks.filter(t => t.status === "COMPLETED").length}/{g.tasks.length})
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
