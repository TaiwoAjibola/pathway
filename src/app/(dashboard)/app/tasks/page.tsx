"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  Plus, Save, Trash2, Loader2, Search, X, Download, ExternalLink,
} from "lucide-react"

type Applicant = { id: string; firstName: string; lastName: string; type: string }

type Assignee = { id: string; applicantId: string; applicant: Applicant }

type Stage = { id: string; stage: { id: string; code: string; name: string; order: number } }

type Task = {
  id: string
  title: string
  description: string | null
  taskType: string
  category: string | null
  stageId: string
  priority: string
  dueDate: string | null
  estimatedCost: number | null
  actualCost: number | null
  currency: string
  paid: boolean
  status: string
  progress: number
  evidence: string | null
  notes: string | null
  completedDate: string | null
  metadata: Record<string, unknown> | null
  assignees: Assignee[]
}

const TASK_TYPES = [
  "DOCUMENT", "EXAM", "PAYMENT", "APPLICATION", "APPOINTMENT",
  "STUDY", "TRAVEL", "MEDICAL", "POLICE_CERTIFICATE",
  "CREDENTIAL_ASSESSMENT", "LANGUAGE_TEST", "OTHER",
] as const

const PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const
const STATUSES = ["NOT_STARTED", "IN_PROGRESS", "WAITING", "BLOCKED", "COMPLETED"] as const

const priorityBadgeVariant: Record<string, "danger" | "warning" | "info" | "outline"> = {
  CRITICAL: "danger", HIGH: "warning", MEDIUM: "info", LOW: "outline",
}

const statusBadgeVariant: Record<string, "success" | "warning" | "info" | "danger" | "outline"> = {
  COMPLETED: "success", IN_PROGRESS: "info", WAITING: "warning", BLOCKED: "danger", NOT_STARTED: "outline",
}

const statusDot: Record<string, string> = {
  COMPLETED: "bg-green-500", IN_PROGRESS: "bg-blue-500", WAITING: "bg-yellow-500",
  NOT_STARTED: "bg-gray-300", BLOCKED: "bg-red-500",
}

type FormState = {
  title: string
  description: string
  taskType: string
  category: string
  stageId: string
  priority: string
  status: string
  progress: number
  dueDate: string
  estimatedCost: string
  actualCost: string
  currency: string
  paid: boolean
  evidence: string
  notes: string
  assigneeIds: string[]
}

const emptyForm = (stageId: string): FormState => ({
  title: "",
  description: "",
  taskType: "OTHER",
  category: "",
  stageId,
  priority: "MEDIUM",
  status: "NOT_STARTED",
  progress: 0,
  dueDate: "",
  estimatedCost: "",
  actualCost: "",
  currency: "CAD",
  paid: false,
  evidence: "",
  notes: "",
  assigneeIds: [],
})

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState("")
  const [filterStage, setFilterStage] = useState("ALL")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [filterPriority, setFilterPriority] = useState("ALL")
  const [filterCategory, setFilterCategory] = useState("ALL")
  const [filterTaskType, setFilterTaskType] = useState("ALL")
  const [filterAssignee, setFilterAssignee] = useState("ALL")

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm(""))

  const categories = [...new Set(tasks.map((t) => t.category).filter(Boolean))] as string[]

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/stages").then((r) => r.json()),
      fetch("/api/family").then((r) => r.json()),
    ])
      .then(([t, s, a]) => {
        setTasks(t)
        setStages(s)
        setApplicants(a)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  function openCreate() {
    setForm(emptyForm(stages[0]?.stage?.id || ""))
    setEditingId(null)
    setShowModal(true)
  }

  function openEdit(task: Task) {
    setForm({
      title: task.title,
      description: task.description || "",
      taskType: task.taskType,
      category: task.category || "",
      stageId: task.stageId,
      priority: task.priority,
      status: task.status,
      progress: task.progress,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      estimatedCost: task.estimatedCost?.toString() || "",
      actualCost: task.actualCost?.toString() || "",
      currency: task.currency,
      paid: task.paid,
      evidence: task.evidence || "",
      notes: task.notes || "",
      assigneeIds: task.assignees.map((a) => a.applicantId),
    })
    setEditingId(task.id)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const body: Record<string, unknown> = {
      title: form.title,
      description: form.description || null,
      taskType: form.taskType,
      category: form.category || null,
      stageId: form.stageId,
      priority: form.priority,
      status: form.status,
      progress: form.progress,
      dueDate: form.dueDate || null,
      estimatedCost: form.estimatedCost || null,
      actualCost: form.actualCost || null,
      currency: form.currency,
      paid: form.paid,
      evidence: form.evidence || null,
      notes: form.notes || null,
      assigneeIds: form.assigneeIds,
    }
    if (editingId) {
      body.id = editingId
      await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    } else {
      await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    }
    setSaving(false)
    closeModal()
    load()
  }

  async function toggleComplete(task: Task) {
    const newStatus = task.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED"
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status: newStatus }),
    })
    load()
  }

  async function handleQuickStatus(task: Task, status: string) {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status }),
    })
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

  const filtered = tasks.filter((t) => {
    if (filterStage !== "ALL" && t.stageId !== filterStage) return false
    if (filterStatus !== "ALL" && t.status !== filterStatus) return false
    if (filterPriority !== "ALL" && t.priority !== filterPriority) return false
    if (filterCategory !== "ALL" && t.category !== filterCategory) return false
    if (filterTaskType !== "ALL" && t.taskType !== filterTaskType) return false
    if (filterAssignee !== "ALL" && !t.assignees.some((a) => a.applicantId === filterAssignee)) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const completed = tasks.filter((t) => t.status === "COMPLETED").length
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length
  const pending = tasks.filter((t) => ["NOT_STARTED", "WAITING"].includes(t.status)).length
  const critical = tasks.filter((t) => t.priority === "CRITICAL" && t.status !== "COMPLETED").length

  const grouped = stages
    .map((s) => ({
      stage: s.stage,
      tasks: filtered.filter((t) => t.stageId === s.stage.id),
    }))
    .filter((g) => g.tasks.length > 0)

  const Select = ({ label, value, onChange, options }: {
    label: string
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
  }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )

  const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {children}
    </div>
  )

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            {tasks.length} tasks &middot; {completed} completed
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {tasks.length === 0 && (
            <Button onClick={seedTasks} loading={seeding} variant="secondary">
              <Download className="h-4 w-4" /> Load Template
            </Button>
          )}
          <Button onClick={openCreate}>
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

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <Select
            label="Stage"
            value={filterStage}
            onChange={setFilterStage}
            options={[{ value: "ALL", label: "All Stages" }, ...stages.map((s) => ({ value: s.stage.id, label: s.stage.name }))]}
          />
          <Select
            label="Status"
            value={filterStatus}
            onChange={setFilterStatus}
            options={[{ value: "ALL", label: "All Statuses" }, ...STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))]}
          />
          <Select
            label="Priority"
            value={filterPriority}
            onChange={setFilterPriority}
            options={[{ value: "ALL", label: "All Priorities" }, ...PRIORITIES.map((p) => ({ value: p, label: p }))]}
          />
          <Select
            label="Task Type"
            value={filterTaskType}
            onChange={setFilterTaskType}
            options={[{ value: "ALL", label: "All Types" }, ...TASK_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, " ") }))]}
          />
          <Select
            label="Category"
            value={filterCategory}
            onChange={setFilterCategory}
            options={[{ value: "ALL", label: "All Categories" }, ...categories.map((c) => ({ value: c, label: c }))]}
          />
          <Select
            label="Assignee"
            value={filterAssignee}
            onChange={setFilterAssignee}
            options={[{ value: "ALL", label: "All Members" }, ...applicants.map((a) => ({ value: a.id, label: `${a.firstName} ${a.lastName}` }))]}
          />
        </div>
      </div>

      {/* Task list grouped by stage */}
      {grouped.length === 0 && (
        <Card>
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-gray-500">No tasks match your filters.</p>
            {tasks.length === 0 && !showModal && (
              <>
                <Button onClick={seedTasks} loading={seeding} variant="secondary">
                  <Download className="h-4 w-4" /> Load Template Tasks
                </Button>
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Create First Task
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {grouped.map((g) => {
        const done = g.tasks.filter((t) => t.status === "COMPLETED").length
        return (
          <Card key={g.stage.id}>
            <div className="flex items-center justify-between">
              <CardTitle>{g.stage.name}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{done}/{g.tasks.length}</span>
                <ProgressBar progress={(done / g.tasks.length) * 100} size="sm" className="w-24" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {g.tasks.map((task) => (
                <div key={task.id}>
                  <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleComplete(task)}
                      className={`mt-0.5 h-5 w-5 flex-shrink-0 rounded border-2 ${
                        task.status === "COMPLETED"
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-gray-300 dark:border-gray-600"
                      } flex items-center justify-center transition-colors`}
                    >
                      {task.status === "COMPLETED" && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${task.status === "COMPLETED" ? "line-through text-gray-400" : "text-gray-900 dark:text-gray-100"}`}>
                          {task.title}
                        </span>
                        <Badge variant={priorityBadgeVariant[task.priority] || "outline"}>{task.priority}</Badge>
                        <Badge variant={statusBadgeVariant[task.status] || "outline"}>
                          {task.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        {task.assignees.length > 0 && (
                          <span>
                            {task.assignees.map((a) => a.applicant.firstName).join(", ")}
                          </span>
                        )}
                        {task.dueDate && (
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                        {(task.estimatedCost != null || task.actualCost != null) && (
                          <span>
                            {task.currency || "CAD"} {task.actualCost ?? task.estimatedCost}
                            {task.paid && " (Paid)"}
                          </span>
                        )}
                        {task.taskType !== "OTHER" && (
                          <Badge variant="outline">{task.taskType.replace(/_/g, " ")}</Badge>
                        )}
                        {task.category && (
                          <span className="text-gray-400">{task.category}</span>
                        )}
                      </div>
                      {task.notes && (
                        <p className="mt-1 text-xs text-gray-400 line-clamp-1">{task.notes}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {task.status === "NOT_STARTED" && (
                        <Button size="sm" onClick={() => handleQuickStatus(task, "IN_PROGRESS")}>Start</Button>
                      )}
                      {task.status === "IN_PROGRESS" && (
                        <Button size="sm" variant="secondary" onClick={() => handleQuickStatus(task, "COMPLETED")}>Done</Button>
                      )}
                      {task.status === "WAITING" && (
                        <Badge variant="warning">Waiting</Badge>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => openEdit(task)}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      })}

      {tasks.length > 10 && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={deleteSeedTasks} className="text-gray-400">
            <Trash2 className="h-4 w-4" /> Reset template tasks
          </Button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-10 pb-10">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingId ? "Edit Task" : "New Task"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Title *"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Submit WES Application"
                    required
                  />
                </div>

                <FormField label="Stage">
                  <select
                    value={form.stageId}
                    onChange={(e) => setForm({ ...form, stageId: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  >
                    {stages.map((s) => (
                      <option key={s.stage.id} value={s.stage.id}>{s.stage.name}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Task Type">
                  <select
                    value={form.taskType}
                    onChange={(e) => setForm({ ...form, taskType: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  >
                    {TASK_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Priority">
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </FormField>

                <Input
                  label="Category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Education, Work"
                />

                <Input
                  label="Progress (0-100)"
                  type="number"
                  min={0}
                  max={100}
                  value={form.progress}
                  onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) || 0 })}
                />

                <Input
                  label="Due Date"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />

                <FormField label="Currency">
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  >
                    <option value="CAD">CAD</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                    <option value="NGN">NGN</option>
                    <option value="Other">Other</option>
                  </select>
                </FormField>

                <Input
                  label="Estimated Cost"
                  type="number"
                  step="0.01"
                  value={form.estimatedCost}
                  onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                  placeholder="0.00"
                />

                <Input
                  label="Actual Cost"
                  type="number"
                  step="0.01"
                  value={form.actualCost}
                  onChange={(e) => setForm({ ...form, actualCost: e.target.value })}
                  placeholder="0.00"
                />

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="paid"
                    checked={form.paid}
                    onChange={(e) => setForm({ ...form, paid: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="paid" className="text-sm font-medium text-gray-700 dark:text-gray-300">Paid</label>
                </div>
              </div>

              <Input
                label="Evidence (URL or text)"
                value={form.evidence}
                onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                placeholder="Link to uploaded file or notes"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  placeholder="Internal notes..."
                />
              </div>

              <FormField label="Assigned Members">
                <div className="space-y-1 max-h-32 overflow-y-auto rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                  {applicants.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.assigneeIds.includes(a.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({ ...form, assigneeIds: [...form.assigneeIds, a.id] })
                          } else {
                            setForm({ ...form, assigneeIds: form.assigneeIds.filter((id) => id !== a.id) })
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {a.firstName} {a.lastName} ({a.type})
                    </label>
                  ))}
                </div>
              </FormField>

              <div className="flex gap-2 pt-2">
                <Button type="submit" loading={saving}>
                  <Save className="h-4 w-4" /> {editingId ? "Save Changes" : "Create Task"}
                </Button>
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
