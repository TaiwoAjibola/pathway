"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  FileText, Loader2, ExternalLink, CheckCircle2, Circle,
} from "lucide-react"

type Applicant = { id: string; firstName: string; lastName: string; type: string }

type Assignee = { id: string; applicantId: string; applicant: Applicant }

type TaskDocument = {
  id: string
  title: string
  description: string | null
  status: string
  taskType: string
  dueDate: string | null
  assignees: Assignee[]
}

type AppDocument = {
  id: string
  name: string
  description: string | null
  issuingAuthority: string | null
  collected: boolean
  uploaded: boolean
  verified: boolean
  expiryDate: string | null
  notes: string | null
  taskId: string | null
  applicant?: { firstName: string; lastName: string } | null
}

type MergedItem = {
  id: string
  name: string
  description: string | null
  assignedTo: string
  collected: boolean
  uploaded: boolean
  verified: boolean
  expiryDate: string | null
  notes: string | null
  taskId: string | null
  source: "task" | "document"
}

export default function DocumentsPage() {
  const [taskDocs, setTaskDocs] = useState<TaskDocument[]>([])
  const [appDocs, setAppDocs] = useState<AppDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [savingTask, setSavingTask] = useState<string | null>(null)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/documents").then((r) => r.json()),
    ])
      .then(([tasks, docs]) => {
        const t = Array.isArray(tasks) ? tasks : []
        const d = Array.isArray(docs) ? docs : []
        setTaskDocs(t.filter((t: TaskDocument) => t.taskType === "DOCUMENT"))
        setAppDocs(d)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(fetchAll, [])

  async function toggleDocField(id: string, field: "collected" | "uploaded" | "verified", value: boolean) {
    setSaving(id)
    await fetch("/api/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    })
    setSaving(null)
    fetchAll()
  }

  async function toggleTaskStatus(id: string, status: string) {
    setSavingTask(id)
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    setSavingTask(null)
    fetchAll()
  }

  const merged: MergedItem[] = [
    ...taskDocs.map((t) => ({
      id: t.id,
      name: t.title,
      description: t.description,
      assignedTo: t.assignees.map((a) => a.applicant?.firstName || "").filter(Boolean).join(", ") || "Unassigned",
      collected: t.status !== "NOT_STARTED",
      uploaded: ["IN_PROGRESS", "WAITING", "BLOCKED", "COMPLETED"].includes(t.status),
      verified: t.status === "COMPLETED",
      expiryDate: t.dueDate,
      notes: t.description,
      taskId: t.id,
      source: "task" as const,
    })),
    ...appDocs.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      assignedTo: d.applicant ? `${d.applicant.firstName} ${d.applicant.lastName}` : "Unassigned",
      collected: d.collected,
      uploaded: d.uploaded,
      verified: d.verified,
      expiryDate: d.expiryDate,
      notes: d.notes,
      taskId: d.taskId,
      source: "document" as const,
    })),
  ]

  const total = merged.length
  const collected = merged.filter((m) => m.collected).length
  const uploaded = merged.filter((m) => m.uploaded).length
  const verified = merged.filter((m) => m.verified).length
  const expiringSoon = merged.filter((m) => m.expiryDate && new Date(m.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
        <p className="mt-1 text-sm text-gray-500">
          {total} document{total !== 1 ? "s" : ""} &middot; {uploaded} uploaded &middot; {verified} verified
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <ProgressBar progress={total > 0 ? 100 : 0} size="sm" className="mt-2" barClassName="bg-blue-500" />
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Collected</p>
          <p className="text-2xl font-bold text-gray-900">{collected}/{total}</p>
          <ProgressBar progress={(collected / Math.max(total, 1)) * 100} size="sm" className="mt-2" />
        </Card>
        <Card className="border-green-200">
          <p className="text-sm text-gray-500">Uploaded</p>
          <p className="text-2xl font-bold text-green-600">{uploaded}/{total}</p>
          <ProgressBar progress={(uploaded / Math.max(total, 1)) * 100} size="sm" className="mt-2" barClassName="bg-green-500" />
        </Card>
        <Card className="border-blue-200">
          <p className="text-sm text-gray-500">Verified</p>
          <p className="text-2xl font-bold text-blue-600">{verified}/{total}</p>
          <ProgressBar progress={(verified / Math.max(total, 1)) * 100} size="sm" className="mt-2" barClassName="bg-blue-500" />
        </Card>
      </div>

      {expiringSoon > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠ {expiringSoon} document{expiringSoon !== 1 ? "s" : ""} expiring within 30 days
          </p>
        </Card>
      )}

      {/* Document List */}
      {merged.length === 0 && (
        <Card>
          <p className="text-sm text-gray-500 text-center py-8">
            No documents found. Create a task with type &quot;DOCUMENT&quot; to see it here.
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {merged.map((item) => (
          <div key={`${item.source}-${item.id}`} className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`mt-0.5 h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center ${
                item.verified
                  ? "bg-green-100 text-green-600"
                  : item.uploaded
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-800"
              }`}>
                <FileText className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                  {item.source === "task" && (
                    <Badge variant="info">Task</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium">{item.assignedTo}</span>
                  {item.expiryDate && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className={new Date(item.expiryDate) < new Date() ? "text-red-500 font-medium" : ""}>
                        Expires {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>

                {item.notes && (
                  <p className="text-xs text-gray-400">{item.notes}</p>
                )}

                {/* Checkboxes */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  {/* Collected */}
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.collected}
                      onChange={(e) => {
                        if (item.source === "document") {
                          toggleDocField(item.id, "collected", e.target.checked)
                        } else {
                          toggleTaskStatus(item.id, e.target.checked ? "IN_PROGRESS" : "NOT_STARTED")
                        }
                      }}
                      disabled={saving === item.id || savingTask === item.id}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Collected
                  </label>

                  {/* Uploaded */}
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.uploaded}
                      onChange={(e) => {
                        if (item.source === "document") {
                          toggleDocField(item.id, "uploaded", e.target.checked)
                        }
                      }}
                      disabled={item.source !== "document" || saving === item.id}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Uploaded
                  </label>

                  {/* Verified */}
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.verified}
                      onChange={(e) => {
                        if (item.source === "document") {
                          toggleDocField(item.id, "verified", e.target.checked)
                        } else {
                          toggleTaskStatus(item.id, e.target.checked ? "COMPLETED" : "IN_PROGRESS")
                        }
                      }}
                      disabled={saving === item.id || savingTask === item.id}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Verified
                  </label>
                </div>
              </div>

              {/* Task Link */}
              {item.taskId && item.source === "document" && (
                <a
                  href={`/app/tasks`}
                  className="flex-shrink-0 text-gray-400 hover:text-blue-500 transition-colors"
                  title="View task"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
