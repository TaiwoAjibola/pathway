"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, CheckCircle2, Loader2, ArrowRight } from "lucide-react"

type Applicant = { id: string; firstName: string; lastName: string; type: string }
type TaskAssignee = { id: string; applicant: Applicant }

type TaskData = {
  id: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  taskType: string
  category: string | null
  assignees: TaskAssignee[]
}

type MonthGroup = {
  monthKey: string
  label: string
  tasks: TaskData[]
}

export default function TimelinePage() {
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return }
        setTasks(Array.isArray(data) ? data : [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length
  const upcomingTasks = tasks.filter(
    (t) => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) >= new Date(),
  ).length

  const monthsMap = new Map<string, { label: string; tasks: TaskData[] }>()
  tasks
    .filter((t) => t.dueDate)
    .forEach((t) => {
      const d = new Date(t.dueDate!)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      if (!monthsMap.has(key)) monthsMap.set(key, { label, tasks: [] })
      monthsMap.get(key)!.tasks.push(t)
    })

  const sortedMonths: MonthGroup[] = Array.from(monthsMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, group]) => ({ ...group, monthKey: key }))

  sortedMonths.forEach((m) => {
    m.tasks.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
  })

  const priorityBadgeVariant: Record<string, "danger" | "warning" | "info" | "default"> = {
    CRITICAL: "danger",
    HIGH: "warning",
    MEDIUM: "info",
    LOW: "default",
  }

  const statusBadgeVariant: Record<string, "success" | "info" | "warning" | "danger" | "default"> = {
    COMPLETED: "success",
    IN_PROGRESS: "info",
    NOT_STARTED: "default",
    WAITING: "warning",
    BLOCKED: "danger",
    NEEDS_REVIEW: "warning",
  }

  const statusLabel: Record<string, string> = {
    NOT_STARTED: "Not Started",
    IN_PROGRESS: "In Progress",
    WAITING: "Waiting",
    BLOCKED: "Blocked",
    COMPLETED: "Completed",
    NEEDS_REVIEW: "Needs Review",
    EXPIRED: "Expired",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Timeline</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tasks auto-organized by due date
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{totalTasks}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{completedTasks}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{inProgressTasks}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{upcomingTasks}</p>
        </Card>
      </div>

      {sortedMonths.length === 0 && (
        <Card>
          <p className="py-4 text-center text-sm text-gray-500">
            No tasks with due dates found. Add tasks to build your timeline.
          </p>
        </Card>
      )}

      {sortedMonths.map((month) => {
        const monthCompleted = month.tasks.filter((t) => t.status === "COMPLETED").length
        return (
          <Card key={month.monthKey}>
            <div className="mb-5 flex items-center justify-between">
              <CardTitle>{month.label}</CardTitle>
              <Badge variant="outline">
                {monthCompleted}/{month.tasks.length} done
              </Badge>
            </div>
            <div className="space-y-0">
              {month.tasks.map((t, idx) => {
                const isLast = idx === month.tasks.length - 1
                const assigneeNames =
                  t.assignees
                    ?.map((a) => `${a.applicant.firstName} ${a.applicant.lastName}`)
                    .join(", ") || ""
                return (
                  <div
                    key={t.id}
                    className={`flex gap-4 ${isLast ? "pb-0" : "mb-4 border-b border-gray-100 pb-4 dark:border-gray-800"}`}
                  >
                    <div className="w-14 flex-shrink-0 pt-1 text-right">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {new Date(t.dueDate!).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <div className="relative flex flex-col items-center pt-1">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          t.status === "COMPLETED"
                            ? "bg-green-500"
                            : t.status === "IN_PROGRESS"
                              ? "bg-blue-500"
                              : t.status === "BLOCKED"
                                ? "bg-red-500"
                                : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.title}</span>
                        <Badge variant={priorityBadgeVariant[t.priority] || "default"} className="flex-shrink-0">
                          {t.priority}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        <Badge variant={statusBadgeVariant[t.status] || "default"} className="flex-shrink-0">
                          {statusLabel[t.status] || t.status}
                        </Badge>
                        {assigneeNames && (
                          <>
                            <ArrowRight className="h-3 w-3 text-gray-300" />
                            <span>{assigneeNames}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {t.status === "COMPLETED" && (
                      <CheckCircle2 className="mt-1.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
