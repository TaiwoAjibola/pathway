"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Plus, Save, Trash2, Loader2, Search, X, User, Heart, Baby, Download, AlertTriangle } from "lucide-react"

type Applicant = { id: string; firstName: string; lastName: string; type: string }
type Stage = { id: string; stage: { id: string; code: string; name: string; order: number } }
type Task = {
  id: string; title: string; description: string | null; status: string; priority: string
  dueDate: string | null; estimatedTimeMinutes: number; stageId: string
  applicant: { id: string; firstName: string; lastName: string; type: string } | null
  metadata: Record<string, unknown> | null
}

const priorityBadge: Record<string, "danger" | "warning" | "info" | "outline"> = {
  CRITICAL: "danger", HIGH: "warning", MEDIUM: "info", LOW: "outline",
}
const statusLabels: Record<string, string> = {
  NOT_STARTED: "Not Started", IN_PROGRESS: "In Progress", WAITING: "Waiting",
  COMPLETED: "Completed", BLOCKED: "Blocked",
}
const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-500", IN_PROGRESS: "bg-blue-500", WAITING: "bg-yellow-500",
  NOT_STARTED: "bg-gray-300", BLOCKED: "bg-red-500",
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [search, setSearch] = useState("")
  const [filterStage, setFilterStage] = useState("ALL")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "", stageId: "", applicantId: "", dueDate: "", priority: "MEDIUM",
    description: "", ownerType: "me", reviewerId: "", dependentIds: [] as string[],
  })

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
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [])

  function resetForm() {
    setForm({
      title: "", stageId: stages[0]?.stage?.id || "", applicantId: applicants[0]?.id || "",
      dueDate: "", priority: "MEDIUM", description: "", ownerType: "me", reviewerId: "", dependentIds: [],
    })
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const body: Record<string, unknown> = {
      title: form.title,
      stageId: form.stageId,
      priority: form.priority,
      dueDate: form.dueDate || null,
      description: form.description || null,
      applicantId: form.applicantId || null,
      metadata: {
        ownerType: form.ownerType,
        reviewerId: form.reviewerId || null,
        dependentIds: form.dependentIds,
      },
    }
    await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    setSaving(false)
    setShowAdd(false)
    setEditingId(null)
    resetForm()
    load()
  }

  async function updateTask(id: string, data: Record<string, unknown>) {
    await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }) })
    load()
  }

  async function deleteTask(id: string) {
    if (!confirm("Delete this task?")) return
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" })
    load()
  }

  async function seedTasks() {
    if (!confirm("This will load all template tasks. Only do this once.")) return
    setSeeding(true)
    const res = await fetch("/api/tasks/seed", { method: "POST" }).then((r) => r.json())
    if (res.error) alert(res.error)
    else alert(`Created ${res.created} tasks!`)
    setSeeding(false)
    load()
  }

  async function deleteSeedTasks() {
    if (!confirm("Delete all template tasks?")) return
    await fetch("/api/tasks/seed", { method: "DELETE" })
    load()
  }

  function startEdit(task: Task) {
    setEditingId(task.id)
    const meta = (task.metadata as Record<string, unknown>) || {}
    const resp = (meta.responsibilities as Record<string, unknown>) || {}
    setForm({
      title: task.title,
      stageId: task.stageId,
      applicantId: task.applicant?.id || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      priority: task.priority,
      description: task.description || "",
      ownerType: (resp.ownerType as string) || "me",
      reviewerId: (resp.reviewerId as string) || "",
      dependentIds: (resp.dependentIds as string[]) || [],
    })
  }

  function cancelEdit() {
    setEditingId(null)
    resetForm()
  }

  async function saveEdit(taskId: string) {
    setSaving(true)
    await updateTask(taskId, {
      title: form.title,
      priority: form.priority,
      dueDate: form.dueDate || null,
      description: form.description || null,
      applicantId: form.applicantId || null,
      metadata: {
        responsibilities: {
          ownerType: form.ownerType,
          reviewerId: form.reviewerId || null,
          dependentIds: form.dependentIds,
        },
      },
    })
    setSaving(false)
    setEditingId(null)
    resetForm()
  }

  const grouped = stages.map((s) => ({
    stage: s.stage,
    tasks: tasks.filter((t) => t.stageId === s.stage.id),
  }))

  const filtered = filterStage === "ALL"
    ? grouped
    : grouped.filter((g) => g.stage.id === filterStage)

  const completed = tasks.filter((t) => t.status === "COMPLETED").length
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length
  const pending = tasks.filter((t) => ["NOT_STARTED", "WAITING"].includes(t.status)).length
  const critical = tasks.filter((t) => t.priority === "CRITICAL" && t.status !== "COMPLETED").length

  const ownerLabel = (t: Task) => {
    const meta = (t.metadata as Record<string, unknown>) || {}
    const resp = (meta.responsibilities as Record<string, unknown>) || {}
    const ot = resp.ownerType as string
    if (ot === "both") return "Both"
    if (ot === "spouse") return "Wife"
    if (ot === "me") return "Me"
    return t.applicant?.firstName || "Unassigned"
  }

  const ownerIcon = (t: Task) => {
    const meta = (t.metadata as Record<string, unknown>) || {}
    const resp = (meta.responsibilities as Record<string, unknown>) || {}
    const ot = resp.ownerType as string
    if (ot === "spouse") return Heart
    if (ot === "both") return User
    return User
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">Plan every step — assign to yourself, your wife, or both</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800 w-40" />
          </div>
          {tasks.length === 0 && (
            <Button onClick={seedTasks} loading={seeding} variant="secondary">
              <Download className="h-4 w-4" /> Load Template
            </Button>
          )}
          <Button onClick={() => { setShowAdd(true); setEditingId(null); resetForm() }}>
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card><p className="text-2xl font-bold text-gray-900">{completed}</p><p className="text-sm text-gray-500">Completed</p></Card>
        <Card><p className="text-2xl font-bold text-blue-600">{inProgress}</p><p className="text-sm text-gray-500">In Progress</p></Card>
        <Card><p className="text-2xl font-bold text-yellow-600">{pending}</p><p className="text-sm text-gray-500">Pending</p></Card>
        <Card><p className="text-2xl font-bold text-red-600">{critical}</p><p className="text-sm text-gray-500">Critical</p></Card>
      </div>

      {/* Filters */}
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

      {/* Add / Edit Task Form */}
      {(showAdd || editingId) && (
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <CardTitle>{editingId ? "Edit Task" : "New Task"}</CardTitle>
            <button onClick={() => { setShowAdd(false); cancelEdit() }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={editingId ? (e) => { e.preventDefault(); saveEdit(editingId) } : addTask} className="mt-4 space-y-4">
            <Input label="Task Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Submit WES Application" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select value={form.stageId} onChange={(e) => setForm({ ...form, stageId: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                  {stages.map((s) => <option key={s.stage.id} value={s.stage.id}>{s.stage.name}</option>)}
                </select>
              </div>
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
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner (who does it)</label>
                <select value={form.ownerType} onChange={(e) => setForm({ ...form, ownerType: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                  <option value="me">Me</option>
                  <option value="spouse">Wife</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer (verifies it)</label>
                <select value={form.reviewerId} onChange={(e) => setForm({ ...form, reviewerId: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                  <option value="">No reviewer</option>
                  {applicants.map((a) => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
                </select>
              </div>
              <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <Input label="Description / Notes" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-2">
              <Button type="submit" loading={saving}><Save className="h-4 w-4" /> {editingId ? "Save Changes" : "Add Task"}</Button>
              <Button type="button" variant="outline" onClick={() => { setShowAdd(false); cancelEdit() }}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tasks grouped by stage */}
      {filtered.map((g) => {
        const stageTasks = g.tasks
          .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
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
              {stageTasks.map((task) => {
                const isEditing = editingId === task.id
                const OwnerIcon = ownerIcon(task)
                return (
                  <div key={task.id}>
                    <div className={`flex items-center gap-3 rounded-lg border p-3 dark:border-gray-800 ${
                      isEditing ? "border-blue-300 bg-blue-50 dark:bg-blue-950" : "border-gray-100"
                    }`}>
                      <div className={`h-3 w-3 rounded-full ${statusColors[task.status] || "bg-gray-300"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
                          <Badge variant={priorityBadge[task.priority] || "outline"}>{task.priority}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                          <span>{statusLabels[task.status] || task.status}</span>
                          <span className="flex items-center gap-1">
                            <OwnerIcon className="h-3 w-3" /> {ownerLabel(task)}
                          </span>
                          {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {task.status === "NOT_STARTED" && <Button size="sm" onClick={() => updateTask(task.id, { status: "IN_PROGRESS" })}>Start</Button>}
                        {task.status === "IN_PROGRESS" && <Button size="sm" variant="secondary" onClick={() => updateTask(task.id, { status: "COMPLETED" })}>Done</Button>}
                        {task.status === "WAITING" && <Badge variant="warning">Waiting</Badge>}
                        <Button size="sm" variant="ghost" onClick={() => startEdit(task)}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Button>
                        <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })}

      {tasks.length === 0 && !showAdd && (
        <Card>
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-gray-500">No tasks yet. Start planning your immigration journey.</p>
            <Button onClick={seedTasks} loading={seeding} variant="secondary">
              <Download className="h-4 w-4" /> Load Template Tasks
            </Button>
            <p className="text-xs text-gray-400">
              Loads a comprehensive task list with ~100 tasks across all 14 stages, assigned to you, your wife, or both.
            </p>
          </div>
        </Card>
      )}

      {tasks.length > 10 && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={deleteSeedTasks} className="text-gray-400">
            <Trash2 className="h-4 w-4" /> Reset template tasks
          </Button>
        </div>
      )}
    </div>
  )
}
