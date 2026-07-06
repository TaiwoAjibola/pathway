"use client"

import { useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProgressBar } from "@/components/ui/progress-bar"
import { getPriorityColor, getStatusColor, getStatusLabel, formatDate } from "@/lib/utils"
import { Search, Filter, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react"

const allTasks = [
  { id: "t1", stage: "Documents", title: "Upload passport copy", status: "COMPLETED", priority: "MEDIUM", dueDate: "2026-07-03", completedDate: "2026-07-01", estimatedTime: 10 },
  { id: "t2", stage: "Documents", title: "Upload marriage certificate", status: "COMPLETED", priority: "MEDIUM", dueDate: "2026-07-05", completedDate: "2026-07-02", estimatedTime: 15 },
  { id: "t3", stage: "Eligibility", title: "Complete FSW 67 eligibility quiz", status: "COMPLETED", priority: "MEDIUM", dueDate: "2026-07-05", completedDate: "2026-07-03", estimatedTime: 15 },
  { id: "t4", stage: "Documents", title: "Gather education documents", status: "COMPLETED", priority: "HIGH", dueDate: "2026-07-02", completedDate: "2026-07-01", estimatedTime: 60 },
  { id: "t5", stage: "Credential Assessment", title: "Submit WES application", status: "NOT_STARTED", priority: "CRITICAL", dueDate: "2026-07-10", estimatedTime: 120 },
  { id: "t6", stage: "Language Tests", title: "Book IELTS exam", status: "IN_PROGRESS", priority: "HIGH", dueDate: "2026-07-20", estimatedTime: 30 },
  { id: "t7", stage: "Employment", title: "Collect reference letters", status: "NOT_STARTED", priority: "HIGH", dueDate: "2026-07-25", estimatedTime: 180 },
  { id: "t8", stage: "Proof of Funds", title: "Get 6 months bank statements", status: "NOT_STARTED", priority: "MEDIUM", dueDate: "2026-08-01", estimatedTime: 60 },
  { id: "t9", stage: "Credential Assessment", title: "Receive ECA report", status: "WAITING", priority: "CRITICAL", dueDate: "2026-09-01", estimatedTime: 0 },
  { id: "t10", stage: "Language Tests", title: "Take IELTS exam", status: "NOT_STARTED", priority: "CRITICAL", dueDate: "2026-08-20", estimatedTime: 180 },
  { id: "t11", stage: "Police Certificate", title: "Apply for PCC (Nigeria)", status: "NOT_STARTED", priority: "HIGH", dueDate: "2026-08-15", estimatedTime: 60 },
  { id: "t12", stage: "Medical", title: "Schedule panel physician appointment", status: "NOT_STARTED", priority: "MEDIUM", dueDate: "2026-09-01", estimatedTime: 30 },
]

const stages = ["Documents", "Eligibility", "Credential Assessment", "Language Tests", "Employment", "Proof of Funds", "Police Certificate", "Medical"]

export default function TasksPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("ALL")

  const filtered = allTasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "ALL" || t.status === filter || t.priority === filter
    return matchesSearch && matchesFilter
  })

  const filters = ["ALL", "NOT_STARTED", "IN_PROGRESS", "WAITING", "COMPLETED", "CRITICAL", "HIGH"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your immigration to-do list</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {getStatusLabel(f)}
          </button>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-2xl font-bold text-gray-900">{allTasks.filter(t => t.status === "COMPLETED").length}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-blue-600">{allTasks.filter(t => t.status === "IN_PROGRESS").length}</p>
          <p className="text-sm text-gray-500">In Progress</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-yellow-600">{allTasks.filter(t => t.status === "WAITING" || t.status === "NOT_STARTED").length}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-red-600">{allTasks.filter(t => t.status === "CRITICAL").length}</p>
          <p className="text-sm text-gray-500">Critical</p>
        </Card>
      </div>

      {/* Tasks by Stage */}
      {stages.map((stage) => {
        const stageTasks = filtered.filter((t) => t.stage === stage)
        if (stageTasks.length === 0) return null
        const completed = stageTasks.filter((t) => t.status === "COMPLETED").length

        return (
          <Card key={stage}>
            <div className="flex items-center justify-between">
              <CardTitle>{stage}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{completed}/{stageTasks.length}</span>
                <ProgressBar progress={(completed / stageTasks.length) * 100} size="sm" className="w-24" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {stageTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700"
                >
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(task.status)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500">
                        {getStatusLabel(task.status)}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-400">
                          Due {formatDate(task.dueDate)}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{task.estimatedTime} min</span>
                    </div>
                  </div>
                  {task.status === "NOT_STARTED" && (
                    <Button size="sm">Start</Button>
                  )}
                  {task.status === "IN_PROGRESS" && (
                    <Button size="sm" variant="secondary">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
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
