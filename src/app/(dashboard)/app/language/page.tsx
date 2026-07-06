"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProgressBar } from "@/components/ui/progress-bar"
import { BookOpen, Loader2, Plus, Save } from "lucide-react"

type LanguageTest = {
  id: string
  testType: string
  language: string
  bookingStatus: string
  resultStatus: string
  listeningScore: number | null
  readingScore: number | null
  writingScore: number | null
  speakingScore: number | null
  overallScore: number | null
  testDate: string | null
  preparationStatus: string
}

export default function LanguagePage() {
  const [tests, setTests] = useState<LanguageTest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ testType: "IELTS_GENERAL", language: "English", testDate: "", listeningScore: "", readingScore: "", writingScore: "", speakingScore: "" })

  const fetchTests = () => {
    fetch("/api/language").then((r) => r.json()).then(setTests).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(fetchTests, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const body = { ...form, testDate: form.testDate || null }
    Object.keys(body).forEach((k) => { const v = (body as Record<string, unknown>)[k]; if (v === "") (body as Record<string, unknown>)[k] = null })
    await fetch("/api/language", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    setSaving(false)
    setShowForm(false)
    setForm({ testType: "IELTS_GENERAL", language: "English", testDate: "", listeningScore: "", readingScore: "", writingScore: "", speakingScore: "" })
    fetchTests()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Language Tests</h1>
          <p className="mt-1 text-sm text-gray-500">Track preparation, bookings, and results</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add Test"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardTitle>Add Language Test</CardTitle>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                <select value={form.testType} onChange={(e) => setForm({ ...form, testType: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                  <option value="IELTS_GENERAL">IELTS General</option>
                  <option value="CELPIP">CELPIP</option>
                  <option value="TEF">TEF Canada</option>
                  <option value="TCF">TCF Canada</option>
                </select>
              </div>
              <Input label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
              <Input label="Test Date" type="date" value={form.testDate} onChange={(e) => setForm({ ...form, testDate: e.target.value })} />
              <Input label="Listening Score" type="number" step="0.5" value={form.listeningScore} onChange={(e) => setForm({ ...form, listeningScore: e.target.value })} />
              <Input label="Reading Score" type="number" step="0.5" value={form.readingScore} onChange={(e) => setForm({ ...form, readingScore: e.target.value })} />
              <Input label="Writing Score" type="number" step="0.5" value={form.writingScore} onChange={(e) => setForm({ ...form, writingScore: e.target.value })} />
              <Input label="Speaking Score" type="number" step="0.5" value={form.speakingScore} onChange={(e) => setForm({ ...form, speakingScore: e.target.value })} />
            </div>
            <Button type="submit" loading={saving}><Save className="h-4 w-4" /> Save Test</Button>
          </form>
        </Card>
      )}

      {tests.length === 0 && !showForm && (
        <Card><p className="text-sm text-gray-500 text-center py-8">No language tests added yet. Click &quot;Add Test&quot; to begin tracking.</p></Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {tests.map((test) => (
          <Card key={test.id}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{test.testType.replace("_", " ")}</p>
                <p className="text-xs text-gray-500">{test.language}</p>
              </div>
              <Badge variant={test.resultStatus === "RECEIVED" ? "success" : "outline"} className="ml-auto">
                {test.resultStatus}
              </Badge>
            </div>
            {test.listeningScore && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Listening</span><span className="font-medium">{test.listeningScore}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Reading</span><span className="font-medium">{test.readingScore}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Writing</span><span className="font-medium">{test.writingScore}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Speaking</span><span className="font-medium">{test.speakingScore}</span></div>
              </div>
            )}
            {test.testDate && <p className="mt-2 text-xs text-gray-500">Test Date: {new Date(test.testDate).toLocaleDateString()}</p>}
          </Card>
        ))}
      </div>
    </div>
  )
}
