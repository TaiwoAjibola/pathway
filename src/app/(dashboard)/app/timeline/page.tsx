"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, CheckCircle2, Loader2, Clock } from "lucide-react"

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

const STAGE_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-teal-500",
  "bg-indigo-500", "bg-pink-500", "bg-lime-500", "bg-sky-500",
]

const STAGE_COLORS_LIGHT = [
  "bg-blue-200", "bg-emerald-200", "bg-violet-200", "bg-amber-200",
  "bg-rose-200", "bg-cyan-200", "bg-orange-200", "bg-teal-200",
  "bg-indigo-200", "bg-pink-200", "bg-lime-200", "bg-sky-200",
]

const BORDER_COLORS = [
  "border-blue-500", "border-emerald-500", "border-violet-500", "border-amber-500",
  "border-rose-500", "border-cyan-500", "border-orange-500", "border-teal-500",
  "border-indigo-500", "border-pink-500", "border-lime-500", "border-sky-500",
]

function toDate(d: string | null): Date | null {
  if (!d) return null
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? null : dt
}

function dayDiff(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

const statusVariant: Record<string, "success" | "info" | "warning" | "danger" | "outline"> = {
  COMPLETED: "success", IN_PROGRESS: "info", NOT_STARTED: "outline", WAITING: "warning", BLOCKED: "danger",
}

function TaskDot({ status }: { status: string }) {
  const color = status === "COMPLETED" ? "bg-green-500"
    : status === "IN_PROGRESS" ? "bg-blue-500"
    : status === "BLOCKED" ? "bg-red-500"
    : "bg-gray-300 dark:bg-gray-600"
  return <div className={`h-2 w-2 rounded-full ${color}`} />
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

  const { chartStart, chartEnd, totalDays, dayWidth } = useMemo(() => {
    const dates: Date[] = []
    const today = new Date()
    dates.push(today)
    for (const s of stages) {
      const sd = toDate(s.startDate)
      const ed = toDate(s.endDate)
      if (sd) dates.push(sd)
      if (ed) dates.push(ed)
    }
    const min = new Date(Math.min(...dates.map(d => d.getTime())))
    const max = new Date(Math.max(...dates.map(d => d.getTime())))
    const padding = Math.max(Math.ceil((max.getTime() - min.getTime()) / 86400000) * 0.1, 14)
    const start = new Date(min.getTime() - padding * 86400000)
    const end = new Date(max.getTime() + padding * 86400000)
    const total = dayDiff(start, end)
    return {
      chartStart: start,
      chartEnd: end,
      totalDays: total,
      dayWidth: total > 0 ? 100 / total : 100,
    }
  }, [stages])

  const todayOffset = useMemo(() => {
    if (!chartStart) return 0
    return dayDiff(chartStart, new Date())
  }, [chartStart])

  // Generate month markers
  const monthMarkers = useMemo(() => {
    const markers: { x: number; label: string }[] = []
    const d = new Date(chartStart)
    d.setDate(1)
    while (d <= chartEnd) {
      const offset = dayDiff(chartStart, d)
      markers.push({
        x: offset * dayWidth,
        label: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      })
      d.setMonth(d.getMonth() + 1)
    }
    return markers
  }, [chartStart, chartEnd, dayWidth])

  // Week markers (every 2 weeks)
  const weekMarkers = useMemo(() => {
    const markers: number[] = []
    for (let i = 0; i <= totalDays; i += 14) {
      markers.push(i * dayWidth)
    }
    return markers
  }, [totalDays, dayWidth])

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

  const GRAPH_HEIGHT = Math.max(stages.length * 60 + 40, 200)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Timeline</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gantt chart showing stage durations and task milestones
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card><p className="text-sm text-gray-500">Stages</p><p className="text-2xl font-bold text-gray-900">{stages.length}</p></Card>
        <Card><p className="text-sm text-gray-500">Completed Tasks</p><p className="text-2xl font-bold text-green-600">{completedTasks}/{totalTasks}</p></Card>
        <Card><p className="text-sm text-gray-500">In Progress</p><p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p></Card>
        <Card>
          <p className="text-sm text-gray-500">Timeline Span</p>
          <p className="text-2xl font-bold text-gray-900">
            {chartStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {" — "}
            {chartEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </Card>
      </div>

      {stages.length === 0 && (
        <Card><p className="py-4 text-center text-sm text-gray-500">No timeline data available.</p></Card>
      )}

      {stages.length > 0 && (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            {/* Month headers */}
            <div className="relative h-8 border-b border-gray-200 dark:border-gray-700">
              {monthMarkers.map((m, i) => (
                <div
                  key={i}
                  className="absolute top-0 text-[10px] text-gray-400 font-medium -translate-x-1/2 whitespace-nowrap"
                  style={{ left: `${m.x}%` }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            {/* Week grid lines */}
            <div className="relative" style={{ height: GRAPH_HEIGHT }}>
              {weekMarkers.map((x, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-gray-100 dark:border-gray-800"
                  style={{ left: `${x}%` }}
                />
              ))}

              {/* Today line */}
              <div
                className="absolute top-0 h-full w-0.5 bg-red-400 z-20"
                style={{ left: `${todayOffset * dayWidth}%` }}
              >
                <div className="absolute -top-1 -translate-x-1/2 text-[9px] font-bold text-red-400 whitespace-nowrap">
                  Today
                </div>
              </div>

              {/* Stage bars */}
              {stages.map((s, idx) => {
                const sd = toDate(s.startDate)
                const ed = toDate(s.endDate)
                const barStart = sd ? dayDiff(chartStart, sd) * dayWidth : 0
                const barWidth = sd && ed ? Math.max((dayDiff(sd, ed) + 1) * dayWidth, 2) : 0
                const isCurrent = s.id === stages.find(st => st.status === "IN_PROGRESS")?.id
                const isComplete = s.status === "COMPLETED"
                const top = idx * 60 + 4
                const colorIdx = idx % STAGE_COLORS.length
                const color = STAGE_COLORS[colorIdx]
                const colorLight = STAGE_COLORS_LIGHT[colorIdx]
                const borderColor = BORDER_COLORS[colorIdx]

                const stageTasks = (s.groups || []).flatMap(g => g.tasks)
                const stageDone = stageTasks.filter(t => t.status === "COMPLETED").length

                return (
                  <div key={s.id} className="absolute w-full" style={{ top, height: 52 }}>
                    {/* Stage name on the left */}
                    <div className="absolute -left-2 -translate-x-full pr-3 w-36 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {isComplete && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />}
                        <span className={`text-xs font-semibold truncate ${isComplete ? "text-green-600" : isCurrent ? "text-blue-600" : "text-gray-700 dark:text-gray-300"}`}>
                          {s.stage.name}
                        </span>
                      </div>
                      {sd && ed && (
                        <p className="text-[9px] text-gray-400 mt-0.5">
                          {sd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {" - "}
                          {ed.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      )}
                    </div>

                    {/* Stage bar */}
                    {barWidth > 0 && (
                      <div
                        className={`relative h-8 rounded-md ${isComplete ? color : colorLight} ${borderColor} border-2 flex items-center overflow-hidden transition-all hover:shadow-md cursor-pointer group`}
                        style={{ marginLeft: `${barStart}%`, width: `${barWidth}%` }}
                      >
                        {/* Progress fill */}
                        {!isComplete && s.progress > 0 && (
                          <div
                            className={`absolute left-0 top-0 h-full ${color} opacity-30 rounded-l-sm`}
                            style={{ width: `${s.progress}%` }}
                          />
                        )}
                        {/* Stage name inside bar */}
                        <span className={`relative z-10 px-2 text-[10px] font-medium truncate ${isComplete ? "text-white" : "text-gray-700 dark:text-gray-800"}`}>
                          {s.stage.name}
                        </span>
                        {/* Task milestone dots */}
                        {stageTasks.map(t => {
                          const taskDate = toDate(t.plannedDate || t.dueDate)
                          if (!taskDate || !sd || !ed) return null
                          const relOffset = dayDiff(sd, taskDate)
                          const pct = Math.max(0, Math.min(100, (relOffset / Math.max(dayDiff(sd, ed), 1)) * 100))
                          return (
                            <div
                              key={t.id}
                              className="absolute -translate-x-1/2 z-10 group/dot"
                              style={{ left: `${pct}%` }}
                            >
                              <div className={`h-2 w-2 rounded-full ring-1 ring-white ${
                                t.status === "COMPLETED" ? "bg-green-500"
                                : t.status === "IN_PROGRESS" ? "bg-blue-500"
                                : t.status === "BLOCKED" ? "bg-red-500"
                                : "bg-gray-500"
                              }`} />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/dot:block z-30">
                                <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-lg">
                                  {t.title}
                                  {taskDate && <span className="ml-1 text-gray-300">({taskDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })})</span>}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {!sd && (
                      <div
                        className="h-8 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
                        style={{ marginLeft: "0%", width: "100%" }}
                      >
                        <span className="text-[10px] text-gray-400 italic">No dates set</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-green-500" /> Completed</div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-blue-500" /> In Progress</div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-gray-300" /> Pending</div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-500" /> Blocked</div>
        <div className="flex items-center gap-1.5"><div className="h-0.5 w-4 bg-red-400" /> Today</div>
        <div className="flex items-center gap-1.5"><div className="h-3 w-6 rounded border-2 border-gray-300 border-dashed" /> No Dates</div>
        <span className="ml-auto text-gray-400">Hover dots to see task names</span>
      </div>

      {/* Task list below chart */}
      {stages.map((s, idx) => {
        const stageTasks = (s.groups || []).flatMap(g => g.tasks)
        if (stageTasks.length === 0) return null
        return (
          <Card key={s.id}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`h-3 w-3 rounded-full ${STAGE_COLORS[idx % STAGE_COLORS.length]}`} />
              <CardTitle>{s.stage.name}</CardTitle>
              <Badge variant={statusVariant[s.status] || "outline"}>
                {s.status === "IN_PROGRESS" ? "In Progress" : s.status}
              </Badge>
            </div>
            <div className="space-y-1.5">
              {stageTasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 text-sm">
                  <TaskDot status={t.status} />
                  <span className={`flex-1 ${t.status === "COMPLETED" ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-300"}`}>
                    {t.title}
                  </span>
                  {t.dueDate && (
                    <span className="text-xs text-gray-400">
                      {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                  {t.priority === "CRITICAL" && t.status !== "COMPLETED" && (
                    <Badge variant="danger" className="text-[10px]">Critical</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
