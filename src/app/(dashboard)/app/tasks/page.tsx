"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Plus, Save, Trash2, Loader2, Search, X, User } from "lucide-react"

type Applicant = { id: string; firstName: string; lastName: string; type: string }
type Stage = { id: string; stage: { id: string; code: string; name: string; order: number } }
type Task = {
  id: string; title: string; description: string | null; status: string; priority: string
  dueDate: string | null; estimatedTimeMinutes: number; stageId: string
  applicant: { id: string; firstName: string; lastName: string; type: string } | null
}

const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
const statusLabels: Record<string, string> = {
  NOT_STARTED: "Not Started", IN_PROGRESS: "In Progress", WAITING: "Waiting",
  COMPLETED: "Completed", BLOCKED: "Blocked",
}
const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-500", IN_PROGRESS: "bg-blue-500", WAITING: "bg-yellow-500",
  NOT_STARTED: "bg-gray-300", BLOCKED: "bg-red-500",
}
const priorityBadge: Record<string, "danger" | "warning" | "info" | "outline"> = {
  CRITICAL: "danger", HIGH: "warning", MEDIUM: "info", LOW: "outline",
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStage, setFilterStage] = useState("ALL")
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: "", stageId: "", applicantId: "", dueDate: "", priority: "MEDIUM", description: "" })

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/stages").then((r) => r.json()),
      fetch("/api/family").then((r) => r.json()),
    ]).then(([t, s, a]) => {
      setTasks(t)
      setStages(s)
      setApplicants(a)
      if (s.length > 0 && !form.stageId) setForm((f) => ({ ...f, stageId: s[0].stage.id }))
      if (a.length > 0 && !form.applicantId) setForm((f) => ({ ...f, applicantId: a[0].id }))
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [form.stageId === "" ? "" : null])

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowAdd(false)
    setForm({ title: "", stageId: stages[0]?.stage?.id || "", applicantId: applicants[0]?.id || "", dueDate: "", priority: "MEDIUM", description: "" })
    load()
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) })
    load()
  }

  async function deleteTask(id: string) {
    if (!confirm("Delete this task?")) return
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" })
    load()
  }

  const grouped = stages.map((s) => ({
    stage: s.stage,
    tasks: tasks.filter((t) => t.stageId === s.stage.id),
  }))

  const completed = tasks.filter((t) => t.status === "COMPLETED").length
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length
  const pending = tasks.filter((t) => ["NOT_STARTED", "WAITING"].includes(t.status)).length
  const critical = tasks.filter((t) => t.priority === "CRITICAL" && t.status !== "COMPLETED").length

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">Plan every step of your immigration journey</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800 w-48" />
          </div>
          <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add Task</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card><p className="text-2xl font-bold text-gray-900">{completed}</p><p className="text-sm text-gray-500">Completed</p></Card>
        <Card><p className="text-2xl font-bold text-blue-600">{inProgress}</p><p className="text-sm text-gray-500">In Progress</p></Card>
        <Card><p className="text-2xl font-bold text-yellow-600">{pending}</p><p className="text-sm text-gray-500">Pending</p></Card>
        <Card><p className="text-2xl font-bold text-red-600">{critical}</p><p className="text-sm text-gray-500">Critical</p></Card>
      </div>

      {/* Stage filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterStage("ALL")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${filterStage === "ALL" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800"}`}>
          All Stages
        </button>
        {stages.map((s) => (
          <button key={s.stage.id} onClick={() => setFilterStage(filterStage === s.stage.id ? "ALL" : s.stage.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${filterStage === s.stage.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800"}`}>
            {s.stage.name}
          </button>
        ))}
      </div>

      {/* Add Task Form */}
      {showAdd && (
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <CardTitle>New Task</CardTitle>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={addTask} className="mt-4 space-y-4">
            <Input label="Task Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Submit WES Application" required />
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select value={form.stageId} onChange={(e) => setForm({ ...form, stageId: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                  {stages.map((s) => <option key={s.stage.id} value={s.stage.id}>{s.stage.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <select value={form.applicantId} onChange={(e) => setForm({ ...form, applicantId: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                  {applicants.map((a) => <option key={a.id} value={a.id}>{a.firstName} {a.lastName} ({a.type})</option>)}
                </select>
              </div>
              <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={saving}><Save className="h-4 w-4" /> Add Task</Button>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tasks by Stage */}
      {grouped.filter((g) => filterStage === "ALL" || g.stage.id === filterStage).map((g) => {
        const stageTasks = g.tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
        if (stageTasks.length === 0) return null
        const done = stageTasks.filter((t) => t.status === "COMPLETED").length
        return (
          <Card key={g.stage.id}>
            <div className="flex items-center justify-between">
              <CardTitle>{g.stage.name}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{done}/{stageTasks.length}</span>
                <ProgressBar progress={(done / stageTasks.length) * 100} size="sm" className="w-24" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {stageTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                  <div className={`h-3 w-3 rounded-full ${statusColors[task.status] || "bg-gray-300"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
                      <Badge variant={priorityBadge[task.priority] || "outline"}>{task.priority}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      <span>{statusLabels[task.status] || task.status}</span>
                      {task.applicant && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {task.applicant.firstName}
                        </span>
                      )}
                      {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {task.status === "NOT_STARTED" && <Button size="sm" onClick={() => updateStatus(task.id, "IN_PROGRESS")}>Start</Button>}
                    {task.status === "IN_PROGRESS" && <Button size="sm" variant="secondary" onClick={() => updateStatus(task.id, "COMPLETED")}>Done</Button>}
                    {task.status === "WAITING" && <Badge variant="warning">Waiting</Badge>}
                    <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      })}

      {tasks.length === 0 && !showAdd && (
        <Card><p className="text-sm text-gray-500 text-center py-8">No tasks yet. Click &quot;Add Task&quot; to start planning your immigration journey.</p></Card>
      )}
    </div>
  )
}
