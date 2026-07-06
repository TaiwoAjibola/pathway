"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/progress-bar"
import { CalendarDays, CheckCircle2, Clock, AlertTriangle, Flag, Loader2 } from "lucide-react"

type StageProgress = {
  id: string
  status: string
  progress: number
  stage: { id: string; code: string; name: string; order: number; estimatedDurationDays: number | null }
  startedAt: string | null
  completedAt: string | null
}

export default function TimelinePage() {
  const [stages, setStages] = useState<StageProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/application").then((r) => r.json()).then((d) => {
      setStages(d.stageProgress || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>

  const completed = stages.filter((s) => s.status === "COMPLETED").length
  const inProgress = stages.filter((s) => s.status === "IN_PROGRESS").length
  const remaining = stages.filter((s) => s.status === "LOCKED").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Timeline</h1>
        <p className="mt-1 text-sm text-gray-500">Your dynamic immigration roadmap</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-gray-500">Completed</p><p className="text-xl font-bold text-green-600">{completed}</p></Card>
        <Card><p className="text-sm text-gray-500">In Progress</p><p className="text-xl font-bold text-blue-600">{inProgress}</p></Card>
        <Card><p className="text-sm text-gray-500">Remaining</p><p className="text-xl font-bold text-gray-900">{remaining}</p></Card>
      </div>

      <Card>
        <CardTitle>Full Journey Timeline</CardTitle>
        <div className="mt-4 space-y-0">
          {stages.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">No stages found for your application.</p>}
          {stages.map((sp, i) => (
            <div key={sp.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 dark:border-gray-800">
              <div className="w-44 flex-shrink-0">
                <p className={`text-sm font-medium ${
                  sp.status === "COMPLETED" ? "text-green-600" : sp.status === "IN_PROGRESS" ? "text-blue-600" : "text-gray-500"
                }`}>
                  {sp.stage.name}
                </p>
                <p className="text-xs text-gray-400">
                  {sp.startedAt ? new Date(sp.startedAt).toLocaleDateString() : "—"} — {sp.completedAt ? new Date(sp.completedAt).toLocaleDateString() : "—"}
                </p>
              </div>
              <div className="flex-1">
                <div className={`h-8 rounded ${
                  sp.status === "COMPLETED" ? "bg-green-500" : sp.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                }`} style={{ width: `${Math.max(5, sp.progress)}%` }} />
              </div>
              <div className="w-20 text-right">
                {sp.status === "COMPLETED" && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
                {sp.status === "IN_PROGRESS" && <span className="text-xs font-medium text-blue-600">{sp.progress}%</span>}
                {sp.status === "UNLOCKED" && <Clock className="h-4 w-4 text-gray-400 ml-auto" />}
                {sp.status === "LOCKED" && <div className="h-4 w-4 rounded border border-gray-300 ml-auto" />}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
