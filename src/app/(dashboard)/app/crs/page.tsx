"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Target, Save, History, FileText } from "lucide-react"

type Snapshot = {
  id: string
  totalScore: number
  createdAt: string
}

export default function ProfileScorePage() {
  const [crsScore, setCrsScore] = useState(0)
  const [targetCrsScore, setTargetCrsScore] = useState(500)
  const [newScore, setNewScore] = useState("")
  const [notes, setNotes] = useState("")
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/application").then((r) => r.json()),
      fetch("/api/crs").then((r) => r.json()),
    ]).then(([app, snaps]) => {
      setCrsScore(app.crsScore ?? 0)
      setTargetCrsScore(app.targetCrsScore ?? 500)
      setNewScore(String(app.crsScore ?? 0))
      setNotes((app.metadata as { scoreNotes?: string })?.scoreNotes ?? "")
      setSnapshots(snaps)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const parsed = parseInt(newScore, 10)
    if (!isNaN(parsed)) {
      await fetch("/api/crs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalScore: parsed }),
      })
      await fetch("/api/application", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crsScore: parsed, notes }),
      })
      setCrsScore(parsed)
      const snaps = await fetch("/api/crs").then((r) => r.json())
      setSnapshots(snaps)
    }
    setSaving(false)
  }

  const gap = targetCrsScore - crsScore

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile Score</h1>
        <p className="mt-1 text-sm text-gray-500">Track your Express Entry CRS score over time</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Current Score</CardTitle>
          <div className="mt-4 flex items-end justify-center gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-500">Current</p>
              <p className={`text-5xl font-bold ${gap > 0 ? "text-yellow-500" : "text-green-500"}`}>{crsScore}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Target</p>
              <p className="text-5xl font-bold text-gray-300 dark:text-gray-600">{targetCrsScore}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Gap</p>
              <p className={`text-5xl font-bold ${gap > 0 ? "text-red-500" : "text-green-500"}`}>{gap > 0 ? `-${gap}` : `+${Math.abs(gap)}`}</p>
            </div>
          </div>
          <ProgressBar progress={(crsScore / targetCrsScore) * 100} size="lg" className="mt-6" barClassName={gap > 0 ? "bg-orange-500" : "bg-green-500"} />
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Update Score
          </CardTitle>
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <Input
              label="Current CRS Score"
              type="number"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Any notes about this score update..."
              />
            </div>
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Score History
        </CardTitle>
        <div className="mt-4">
          {snapshots.length === 0 ? (
            <p className="text-sm text-gray-500">No score history yet. Save your first score above.</p>
          ) : (
            <div className="space-y-2">
              {snapshots.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{s.totalScore} points</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
