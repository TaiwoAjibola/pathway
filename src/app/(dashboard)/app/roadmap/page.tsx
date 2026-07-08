"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  Loader2, Plus, GripVertical, ChevronDown, ChevronRight,
  CheckCircle2, Circle, Clock, CalendarDays, Save, X, Trash2,
} from "lucide-react"

type Stage = {
  id: string
  status: string
  progress: number
  startedAt: string | null
  completedAt: string | null
  startDate: string | null
  endDate: string | null
  duration: number | null
  notes: string | null
  stage: { id: string; code: string; name: string; description: string | null; order: number }
  groups: Group[]
}

type Group = {
  id: string
  name: string
  description: string | null
  order: number
  tasks: Task[]
}

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  taskType: string
  order: number
  dueDate: string | null
  plannedDate: string | null
  plannedTime: string | null
  deadline: string | null
  completedDate: string | null
  assignees: { applicant: { id: string; firstName: string; lastName: string } }[]
  dependencies: { dependsOn: { id: string; title: string; status: string } }[]
}

type Applicant = { id: string; firstName: string; lastName: string; type: string }

export default function RoadmapPage() {
  const [stages, setStages] = useState<Stage[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const [editingStage, setEditingStage] = useState<string | null>(null)
  const [stageForm, setStageForm] = useState({ startDate: "", endDate: "", duration: "", notes: "" })

  const [addingGroup, setAddingGroup] = useState<string | null>(null)
  const [groupForm, setGroupForm] = useState({ name: "", description: "" })

  const [addingTask, setAddingTask] = useState<{ groupId: string; stageId: string } | null>(null)
  const [taskForm, setTaskForm] = useState({ title: "", description: "", taskType: "OTHER", assigneeIds: [] as string[] })

  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch("/api/stages?include=tasks")
      .then(r => r.json())
      .then(d => {
        const data = d && typeof d === "object" && !Array.isArray(d) ? d : {}
        setStages(Array.isArray(data.stages) ? data.stages : [])
        setApplicants(Array.isArray(data.applicants) ? data.applicants : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  function toggleStage(id: string) {
    setExpandedStages(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleGroup(id: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function openStageEdit(s: Stage) {
    setEditingStage(s.id)
    setStageForm({
      startDate: s.startDate ? new Date(s.startDate).toISOString().split("T")[0] : "",
      endDate: s.endDate ? new Date(s.endDate).toISOString().split("T")[0] : "",
      duration: s.duration?.toString() || "",
      notes: s.notes || "",
    })
  }

  async function saveStageEdit(id: string) {
    setSaving(true)
    await fetch("/api/stages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...stageForm }),
    })
    setSaving(false)
    setEditingStage(null)
    load()
  }

  async function createGroup(stageId: string) {
    if (!groupForm.name.trim()) return
    setSaving(true)
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationStageId: stageId, ...groupForm, order: 0 }),
    })
    setSaving(false)
    setAddingGroup(null)
    setGroupForm({ name: "", description: "" })
    load()
  }

  async function deleteGroup(id: string) {
    if (!confirm("Delete this group and all its tasks?")) return
    await fetch(`/api/groups?id=${id}`, { method: "DELETE" })
    load()
  }

  async function createTask(groupId: string, stageId: string) {
    if (!taskForm.title.trim()) return
    setSaving(true)
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stageId,
        groupId,
        title: taskForm.title,
        description: taskForm.description || null,
        taskType: taskForm.taskType,
        assigneeIds: taskForm.assigneeIds,
      }),
    })
    setSaving(false)
    setAddingTask(null)
    setTaskForm({ title: "", description: "", taskType: "OTHER", assigneeIds: [] })
    load()
  }

  async function toggleTaskComplete(task: Task) {
    const newStatus = task.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED"
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status: newStatus }),
    })
    load()
  }

  function calcDuration(s: Stage): string {
    if (s.duration) return `${s.duration} days`
    if (s.startDate && s.endDate) {
      const d = Math.round((new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / (1000 * 60 * 60 * 24))
      return `${d} days`
    }
    return "—"
  }

  function groupProgress(tasks: Task[]): number {
    if (tasks.length === 0) return 0
    return Math.round((tasks.filter(t => t.status === "COMPLETED").length / tasks.length) * 100)
  }

  const statusVariant: Record<string, "success" | "info" | "warning" | "danger" | "outline"> = {
    COMPLETED: "success", IN_PROGRESS: "info", UNLOCKED: "warning", LOCKED: "outline",
  }

  const statusDot: Record<string, string> = {
    COMPLETED: "bg-green-500", IN_PROGRESS: "bg-blue-500", UNLOCKED: "bg-yellow-500", LOCKED: "bg-gray-300",
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Migration Roadmap</h1>
        <p className="mt-1 text-sm text-gray-500">
          {stages.length} stages &middot; {stages.filter(s => s.status === "COMPLETED").length} completed
        </p>
      </div>

      {/* Stage Timeline Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-500">Total Stages</p>
          <p className="text-2xl font-bold text-gray-900">{stages.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stages.filter(s => s.status === "IN_PROGRESS").length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stages.filter(s => s.status === "COMPLETED").length}</p>
        </Card>
      </div>

      {stages.length === 0 && (
        <Card>
          <p className="text-sm text-gray-500 text-center py-8">No stages found for your application.</p>
        </Card>
      )}

      {/* Stage List */}
      <div className="space-y-4">
        {stages.map((s, idx) => {
          const isExpanded = expandedStages.has(s.id)
          const totalTasks = s.groups.reduce((sum, g) => sum + g.tasks.length, 0)
          const doneTasks = s.groups.reduce((sum, g) => sum + g.tasks.filter(t => t.status === "COMPLETED").length, 0)
          const stageDone = doneTasks / Math.max(totalTasks, 1)

          return (
            <Card key={s.id}>
              {/* Stage Header */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center pt-1">
                  <button
                    onClick={() => toggleStage(s.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded-full ${statusDot[s.status] || "bg-gray-300"}`} />
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{s.stage.name}</span>
                        <Badge variant={statusVariant[s.status] || "outline"} className="ml-2">
                          {s.status === "IN_PROGRESS" ? "In Progress" : s.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {s.startDate ? new Date(s.startDate).toLocaleDateString() : "—"}
                        {" → "}
                        {s.endDate ? new Date(s.endDate).toLocaleDateString() : "—"}
                      </span>
                      <span className="text-gray-300">|</span>
                      <Clock className="h-4 w-4" />
                      <span>{calcDuration(s)}</span>
                      <Button size="sm" variant="ghost" onClick={() => openStageEdit(s)}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  {s.stage.description && (
                    <p className="mt-1 text-sm text-gray-500">{s.stage.description}</p>
                  )}
                  {totalTasks > 0 && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-gray-400">{doneTasks}/{totalTasks} tasks</span>
                      <ProgressBar progress={stageDone * 100} size="sm" className="flex-1 max-w-xs" />
                    </div>
                  )}
                </div>
              </div>

              {/* Stage Edit Form */}
              {editingStage === s.id && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3 dark:border-blue-800 dark:bg-blue-950/30">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input label="Start Date" type="date" value={stageForm.startDate}
                      onChange={e => setStageForm({ ...stageForm, startDate: e.target.value })} />
                    <Input label="End Date" type="date" value={stageForm.endDate}
                      onChange={e => setStageForm({ ...stageForm, endDate: e.target.value })} />
                    <Input label="Duration (days)" type="number" value={stageForm.duration}
                      onChange={e => setStageForm({ ...stageForm, duration: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea value={stageForm.notes}
                      onChange={e => setStageForm({ ...stageForm, notes: e.target.value })}
                      rows={2}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => saveStageEdit(s.id)} loading={saving} size="sm">
                      <Save className="h-4 w-4" /> Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingStage(null)}>
                      <X className="h-4 w-4" /> Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Stage Content (Groups & Tasks) */}
              {isExpanded && (
                <div className="mt-4 space-y-3">
                  {s.groups.length === 0 && !addingGroup && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No task groups yet. Create one to organize your tasks.
                    </p>
                  )}

                  {s.groups.map(g => {
                    const isGroupExpanded = expandedGroups.has(g.id)
                    const gp = groupProgress(g.tasks)
                    return (
                      <div key={g.id} className="rounded-lg border border-gray-100 dark:border-gray-800">
                        {/* Group Header */}
                        <div className="flex items-center gap-2 px-3 py-2">
                          <button onClick={() => toggleGroup(g.id)} className="text-gray-400 hover:text-gray-600">
                            {isGroupExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                          <GripVertical className="h-4 w-4 text-gray-300" />
                          <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">{g.name}</span>
                          {g.tasks.length > 0 && (
                            <span className="text-xs text-gray-400">{g.tasks.filter(t => t.status === "COMPLETED").length}/{g.tasks.length}</span>
                          )}
                          {gp > 0 && <ProgressBar progress={gp} size="sm" className="w-16" />}
                          <Button size="sm" variant="ghost" onClick={() => setAddingTask({ groupId: g.id, stageId: s.id })}>
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                          <button onClick={() => deleteGroup(g.id)} className="p-1 text-gray-400 hover:text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Tasks */}
                        {isGroupExpanded && (
                          <div className="border-t border-gray-100 dark:border-gray-800">
                            {g.tasks.length === 0 && (
                              <p className="text-xs text-gray-400 text-center py-3">No tasks in this group.</p>
                            )}
                            {g.tasks.map(t => (
                              <div key={t.id} className="flex items-start gap-3 border-b border-gray-50 px-3 py-2.5 last:border-0 dark:border-gray-800">
                                <button
                                  onClick={() => toggleTaskComplete(t)}
                                  className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded border-2 ${
                                    t.status === "COMPLETED"
                                      ? "border-green-500 bg-green-500 text-white"
                                      : "border-gray-300 dark:border-gray-600"
                                  } flex items-center justify-center`}
                                >
                                  {t.status === "COMPLETED" && (
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm ${t.status === "COMPLETED" ? "line-through text-gray-400" : "text-gray-900 dark:text-gray-100"}`}>
                                      {t.title}
                                    </span>
                                    {t.taskType !== "OTHER" && (
                                      <Badge variant="outline" className="text-[10px]">{t.taskType.replace(/_/g, " ")}</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                                    {t.assignees.length > 0 && (
                                      <span>{t.assignees.map(a => a.applicant.firstName).join(", ")}</span>
                                    )}
                                    {t.dueDate && <span>Due {new Date(t.dueDate).toLocaleDateString()}</span>}
                                    {t.plannedDate && <span>Plan {new Date(t.plannedDate).toLocaleDateString()}</span>}
                                    {t.dependencies.length > 0 && (
                                      <span className="text-amber-500">⏳ {t.dependencies.length} dep{t.dependencies.length > 1 ? "s" : ""}</span>
                                    )}
                                  </div>
                                </div>
                                <span className={`mt-0.5 h-2 w-2 rounded-full ${
                                  t.status === "COMPLETED" ? "bg-green-500" : t.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-gray-300"
                                }`} />
                              </div>
                            ))}

                            {/* Add Task Form (inline) */}
                            {addingTask?.groupId === g.id && (
                              <div className="border-t border-blue-200 bg-blue-50/50 p-3 space-y-2 dark:border-blue-800 dark:bg-blue-950/20">
                                <Input label="Task Title" value={taskForm.title}
                                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                                  placeholder="e.g. Submit WES application" />
                                <div className="flex items-center gap-2">
                                  <select value={taskForm.taskType}
                                    onChange={e => setTaskForm({ ...taskForm, taskType: e.target.value })}
                                    className="block rounded-lg border border-gray-300 px-2 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800"
                                  >
                                    <option value="OTHER">General</option>
                                    <option value="DOCUMENT">Document</option>
                                    <option value="EXAM">Exam</option>
                                    <option value="PAYMENT">Payment</option>
                                    <option value="APPLICATION">Application</option>
                                    <option value="APPOINTMENT">Appointment</option>
                                    <option value="STUDY">Study</option>
                                  </select>
                                  <Button size="sm" onClick={() => createTask(g.id, s.id)} loading={saving}>
                                    <Save className="h-3.5 w-3.5" /> Add
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setAddingTask(null)}>
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Add Group Form */}
                  {addingGroup === s.id && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 space-y-2 dark:border-blue-800 dark:bg-blue-950/20">
                      <Input label="Group Name" value={groupForm.name}
                        onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                        placeholder="e.g. Identity Documents" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => createGroup(s.id)} loading={saving}>
                          <Save className="h-3.5 w-3.5" /> Create Group
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setAddingGroup(null); setGroupForm({ name: "", description: "" }) }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {!addingGroup && (
                    <Button size="sm" variant="outline" onClick={() => setAddingGroup(s.id)} className="w-full">
                      <Plus className="h-4 w-4" /> Add Task Group
                    </Button>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
