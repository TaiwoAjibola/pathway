"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Search, Loader2 } from "lucide-react"

const statusLabels: Record<string, string> = {
  NOT_STARTED: "Not Started", IN_PROGRESS: "In Progress", WAITING: "Waiting",
  BLOCKED: "Blocked", COMPLETED: "Completed", EXPIRED: "Expired", NEEDS_REVIEW: "Needs Review",
}
const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-500", IN_PROGRESS: "bg-blue-500", WAITING: "bg-yellow-500",
  NOT_STARTED: "bg-gray-300", BLOCKED: "bg-red-500",
}
const priorityLabels: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700", HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-blue-100 text-blue-700", LOW: "bg-gray-100 text-gray-700",
}

type Task = {
  id: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  estimatedTimeMinutes: number
  stageId: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")

  const fetchTasks = () => {
    setLoading(true)
    fetch("/api/tasks")
      .then((r) => r.json())
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(fetchTasks, [])

  async function updateStatus(id: string, status: string) {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    fetchTasks()
  }

  const filtered = tasks.filter((t) => {
    const s = search.toLowerCase()
    return t.title.toLowerCase().includes(s)
  })

  const filters = ["ALL", "NOT_STARTED", "IN_PROGRESS", "WAITING", "COMPLETED", "CRITICAL", "HIGH"]
  const shown = filter === "ALL" ? filtered : filtered.filter((t) => t.status === filter || t.priority === filter)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your immigration to-do list</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}>
            {f === "ALL" ? "All" : statusLabels[f] || f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === "COMPLETED").length}</p><p className="text-sm text-gray-500">Completed</p></Card>
        <Card><p className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === "IN_PROGRESS").length}</p><p className="text-sm text-gray-500">In Progress</p></Card>
        <Card><p className="text-2xl font-bold text-yellow-600">{tasks.filter(t => ["NOT_STARTED", "WAITING"].includes(t.status)).length}</p><p className="text-sm text-gray-500">Pending</p></Card>
        <Card><p className="text-2xl font-bold text-red-600">{tasks.filter(t => t.priority === "CRITICAL" && t.status !== "COMPLETED").length}</p><p className="text-sm text-gray-500">Critical</p></Card>
      </div>

      {shown.length === 0 && (
        <Card><p className="text-sm text-gray-500 text-center py-8">No tasks found. Tasks will appear once you start your application.</p></Card>
      )}

      <div className="space-y-4">
        {shown.map((task) => (
          <div key={task.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
            <div className={`h-3 w-3 rounded-full ${statusColors[task.status] || "bg-gray-300"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityLabels[task.priority] || ""}`}>{task.priority}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-gray-500">{statusLabels[task.status] || task.status}</span>
                {task.dueDate && <span className="text-xs text-gray-400">Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                <span className="text-xs text-gray-400">{task.estimatedTimeMinutes} min</span>
              </div>
            </div>
            {task.status === "NOT_STARTED" && <Button size="sm" onClick={() => updateStatus(task.id, "IN_PROGRESS")}>Start</Button>}
            {task.status === "IN_PROGRESS" && <Button size="sm" variant="secondary" onClick={() => updateStatus(task.id, "COMPLETED")}>Complete</Button>}
          </div>
        ))}
      </div>
    </div>
  )
}
