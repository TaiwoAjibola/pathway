"use client"

import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { formatDate, formatDateShort, daysUntil } from "@/lib/utils"
import { CalendarDays, CheckCircle2, Clock, AlertTriangle, Flag, ArrowRight } from "lucide-react"

const milestones = [
  { stage: "Planning", status: "COMPLETED", start: "Jun 1", end: "Jun 3", progress: 100 },
  { stage: "Eligibility", status: "COMPLETED", start: "Jun 4", end: "Jun 7", progress: 100 },
  { stage: "Document Gathering", status: "COMPLETED", start: "Jun 8", end: "Jun 20", progress: 100 },
  { stage: "Credential Assessment", status: "IN_PROGRESS", start: "Jun 21", end: "Sep 1", progress: 40, critical: true },
  { stage: "Language Tests", status: "IN_PROGRESS", start: "Jun 21", end: "Sep 3", progress: 25 },
  { stage: "Employment Verification", status: "UPCOMING", start: "Jul 1", end: "Aug 15", progress: 0 },
  { stage: "Proof of Funds", status: "UPCOMING", start: "Aug 1", end: "Aug 15", progress: 0 },
  { stage: "Express Entry Profile", status: "LOCKED", start: "Sep 15", end: "Sep 20", progress: 0 },
  { stage: "ITA Preparation", status: "LOCKED", start: "TBD", end: "TBD", progress: 0 },
  { stage: "Medical Exam", status: "LOCKED", start: "TBD", end: "TBD", progress: 0 },
  { stage: "Police Certificates", status: "LOCKED", start: "TBD", end: "TBD", progress: 0 },
  { stage: "Final PR Application", status: "LOCKED", start: "TBD", end: "TBD", progress: 0 },
  { stage: "Approval", status: "LOCKED", start: "TBD", end: "TBD", progress: 0 },
  { stage: "Landing", status: "LOCKED", start: "TBD", end: "TBD", progress: 0 },
]

const weekTasks = [
  { day: "Today", tasks: [{ title: "Submit WES Application", status: "CRITICAL", done: false }] },
  { day: "This Week", tasks: [
    { title: "Book IELTS Test", status: "HIGH", done: false },
    { title: "Gather employment reference letters", status: "HIGH", done: false },
  ]},
  { day: "Next Week", tasks: [
    { title: "Send transcripts to WES", status: "HIGH", done: false },
    { title: "Proof of Funds - request bank statements", status: "MEDIUM", done: false },
  ]},
]

const GanttBar = ({ start, end, status, progress, isCritical }: { start: string; end: string; status: string; progress: number; isCritical?: boolean }) => {
  const getColor = () => {
    if (status === "COMPLETED") return "bg-green-500"
    if (status === "IN_PROGRESS") return isCritical ? "bg-red-500" : "bg-blue-500"
    if (status === "UPCOMING") return "bg-gray-300 dark:bg-gray-600"
    return "bg-gray-200 dark:bg-gray-700"
  }
  return (
    <div className={`h-8 rounded ${getColor()} transition-all`} style={{ width: `${Math.max(10, progress)}%` }}>
      {isCritical && status === "IN_PROGRESS" && (
        <div className="flex items-center justify-center h-full">
          <AlertTriangle className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  )
}

export default function TimelinePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Timeline</h1>
          <p className="mt-1 text-sm text-gray-500">Your dynamic immigration roadmap</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-500" />
            <span className="text-gray-500">Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span className="text-gray-500">In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-red-500" />
            <span className="text-gray-500">Critical Path</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-500">Projected Submission</p>
          <p className="text-xl font-bold text-gray-900">Dec 15, 2026</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Days Remaining</p>
          <p className="text-xl font-bold text-blue-600">162 days</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Est. Approval</p>
          <p className="text-xl font-bold text-gray-900">Q2 2027</p>
        </Card>
      </div>

      {/* Gantt Timeline */}
      <Card>
        <CardTitle>Full Journey Timeline</CardTitle>
        <div className="mt-4 space-y-0">
          {milestones.map((ms, i) => (
            <div key={ms.stage} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 dark:border-gray-800">
              {/* Stage name */}
              <div className="w-44 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <p className={`text-sm font-medium ${
                    ms.status === "COMPLETED" ? "text-green-600" :
                    ms.status === "IN_PROGRESS" ? "text-blue-600" : "text-gray-500"
                  }`}>
                    {ms.stage}
                  </p>
                  {ms.critical && <AlertTriangle className="h-3 w-3 text-red-500" />}
                </div>
                <p className="text-xs text-gray-400">
                  {ms.start} — {ms.end}
                </p>
              </div>

              {/* Progress bar */}
              <div className="flex-1">
                <GanttBar start={ms.start} end={ms.end} status={ms.status} progress={ms.progress} isCritical={ms.critical} />
              </div>

              {/* Status badge */}
              <div className="w-20 text-right">
                {ms.status === "COMPLETED" && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
                {ms.status === "IN_PROGRESS" && <span className="text-xs font-medium text-blue-600">{ms.progress}%</span>}
                {ms.status === "UPCOMING" && <Clock className="h-4 w-4 text-gray-400 ml-auto" />}
                {ms.status === "LOCKED" && <div className="h-4 w-4 rounded border border-gray-300 ml-auto" />}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* This Week / Month */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-500" />
            What&apos;s Next
          </CardTitle>
          <div className="mt-4 space-y-4">
            {weekTasks.map((period) => (
              <div key={period.day}>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">{period.day}</p>
                {period.tasks.map((task) => (
                  <div key={task.title} className="flex items-center gap-3 py-2">
                    <div className={`h-4 w-4 rounded border-2 ${
                      task.done ? "bg-green-500 border-green-500" : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {task.done && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <p className="flex-1 text-sm text-gray-900 dark:text-gray-100">{task.title}</p>
                    <Badge variant={task.status === "CRITICAL" ? "danger" : "warning"}>{task.status}</Badge>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-purple-500" />
            Milestones
          </CardTitle>
          <div className="mt-4 space-y-4">
            {[
              { label: "Credential Assessment Complete", date: "Sep 2026", status: "ON_TRACK" },
              { label: "Language Tests Complete", date: "Sep 2026", status: "ON_TRACK" },
              { label: "Express Entry Profile Created", date: "Oct 2026", status: "PLANNED" },
              { label: "ITA Received", date: "Nov 2026 (est.)", status: "ESTIMATED" },
              { label: "PR Application Submitted", date: "Dec 2026 (est.)", status: "ESTIMATED" },
              { label: "Application Approved", date: "Q2 2027 (est.)", status: "ESTIMATED" },
              { label: "Land in Canada", date: "Q3 2027 (est.)", status: "ESTIMATED" },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{m.label}</p>
                  <p className="text-xs text-gray-500">{m.date}</p>
                </div>
                <Badge variant={
                  m.status === "COMPLETED" ? "success" :
                  m.status === "ON_TRACK" ? "info" : "outline"
                }>
                  {m.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
