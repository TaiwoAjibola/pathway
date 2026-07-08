"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BookOpen, Loader2, Plus, Save, X, FileText, CalendarDays, Clock,
} from "lucide-react"

type TestRecord = {
  id: string
  testType: string
  language: string
  testCenter: string | null
  testDate: string | null
  resultDate: string | null
  expiryDate: string | null
  listeningScore: number | null
  readingScore: number | null
  writingScore: number | null
  speakingScore: number | null
  overallScore: number | null
  trfNumber: string | null
  testReportUrl: string | null
  bookingReference: string | null
  preparationStatus: string
  resultStatus: string
  notes: string | null
  createdAt: string
}

const emptyForm = {
  testType: "IELTS_GENERAL", language: "English", testCenter: "",
  testDate: "", resultDate: "", expiryDate: "",
  listeningScore: "", readingScore: "", writingScore: "", speakingScore: "", overallScore: "",
  trfNumber: "", testReportUrl: "", bookingReference: "",
  notes: "",
}

export default function LanguagePage() {
  const [tests, setTests] = useState<TestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const fetchTests = () => {
    fetch("/api/language").then(r => r.json()).then(setTests).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(fetchTests, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const body: Record<string, unknown> = {}
    Object.entries(form).forEach(([k, v]) => {
      body[k] = v || null
    })

    if (editingId) {
      await fetch("/api/language", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...body }),
      })
    } else {
      await fetch("/api/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    }
    setSaving(false)
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    fetchTests()
  }

  function openEdit(t: TestRecord) {
    setForm({
      testType: t.testType, language: t.language, testCenter: t.testCenter || "",
      testDate: t.testDate ? new Date(t.testDate).toISOString().split("T")[0] : "",
      resultDate: t.resultDate ? new Date(t.resultDate).toISOString().split("T")[0] : "",
      expiryDate: t.expiryDate ? new Date(t.expiryDate).toISOString().split("T")[0] : "",
      listeningScore: t.listeningScore?.toString() || "",
      readingScore: t.readingScore?.toString() || "",
      writingScore: t.writingScore?.toString() || "",
      speakingScore: t.speakingScore?.toString() || "",
      overallScore: t.overallScore?.toString() || "",
      trfNumber: t.trfNumber || "", testReportUrl: t.testReportUrl || "",
      bookingReference: t.bookingReference || "", notes: t.notes || "",
    })
    setEditingId(t.id)
    setShowForm(true)
  }

  const resultBadge: Record<string, "success" | "info" | "warning" | "outline"> = {
    RECEIVED: "success", VALIDATED: "success", PENDING: "warning", EXPIRED: "outline",
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Language Tests</h1>
          <p className="mt-1 text-sm text-gray-500">{tests.length} test record{tests.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}>
          <Plus className="h-4 w-4" /> {showForm ? "Cancel" : "Add Record"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200">
          <CardTitle>{editingId ? "Edit Test Record" : "New Test Record"}</CardTitle>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                <select value={form.testType} onChange={e => setForm({ ...form, testType: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                  <option value="IELTS_GENERAL">IELTS General</option>
                  <option value="CELPIP">CELPIP</option>
                  <option value="TEF">TEF Canada</option>
                  <option value="TCF">TCF Canada</option>
                </select>
              </div>
              <Input label="Language" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} />
              <Input label="Test Center" value={form.testCenter} onChange={e => setForm({ ...form, testCenter: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Test Date" type="date" value={form.testDate} onChange={e => setForm({ ...form, testDate: e.target.value })} />
              <Input label="Result Date" type="date" value={form.resultDate} onChange={e => setForm({ ...form, resultDate: e.target.value })} />
              <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-5">
              <Input label="Listening" type="number" step="0.5" value={form.listeningScore} onChange={e => setForm({ ...form, listeningScore: e.target.value })} />
              <Input label="Reading" type="number" step="0.5" value={form.readingScore} onChange={e => setForm({ ...form, readingScore: e.target.value })} />
              <Input label="Writing" type="number" step="0.5" value={form.writingScore} onChange={e => setForm({ ...form, writingScore: e.target.value })} />
              <Input label="Speaking" type="number" step="0.5" value={form.speakingScore} onChange={e => setForm({ ...form, speakingScore: e.target.value })} />
              <Input label="Overall" type="number" step="0.5" value={form.overallScore} onChange={e => setForm({ ...form, overallScore: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="TRF Number" value={form.trfNumber} onChange={e => setForm({ ...form, trfNumber: e.target.value })} />
              <Input label="Test Report URL" value={form.testReportUrl} onChange={e => setForm({ ...form, testReportUrl: e.target.value })} />
              <Input label="Booking Reference" value={form.bookingReference} onChange={e => setForm({ ...form, bookingReference: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            </div>
            <Button type="submit" loading={saving}><Save className="h-4 w-4" /> {editingId ? "Update Record" : "Save Record"}</Button>
          </form>
        </Card>
      )}

      {tests.length === 0 && !showForm && (
        <Card><p className="text-sm text-gray-500 text-center py-8">No test records yet. Click &quot;Add Record&quot; to begin.</p></Card>
      )}

      <div className="space-y-3">
        {tests.map(t => (
          <Card key={t.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.testType.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-500">{t.language}{t.testCenter ? ` · ${t.testCenter}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={resultBadge[t.resultStatus] || "outline"}>{t.resultStatus}</Badge>
                <Button size="sm" variant="ghost" onClick={() => openEdit(t)}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Scores */}
            {t.overallScore != null && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: "Listening", value: t.listeningScore },
                  { label: "Reading", value: t.readingScore },
                  { label: "Writing", value: t.writingScore },
                  { label: "Speaking", value: t.speakingScore },
                  { label: "Overall", value: t.overallScore, highlight: true },
                ].map(s => (
                  <div key={s.label} className={`text-center rounded-lg p-2 ${s.highlight ? "bg-blue-50 dark:bg-blue-950/30" : "bg-gray-50 dark:bg-gray-800"}`}>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className={`text-lg font-bold ${s.highlight ? "text-blue-600" : "text-gray-900"}`}>{s.value ?? "—"}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Dates & References */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              {t.testDate && (
                <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Test: {new Date(t.testDate).toLocaleDateString()}</span>
              )}
              {t.resultDate && (
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Result: {new Date(t.resultDate).toLocaleDateString()}</span>
              )}
              {t.expiryDate && (
                <span className="flex items-center gap-1 text-amber-600"><CalendarDays className="h-3.5 w-3.5" /> Expires: {new Date(t.expiryDate).toLocaleDateString()}</span>
              )}
              {t.trfNumber && <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> TRF: {t.trfNumber}</span>}
              {t.bookingReference && <span>Ref: {t.bookingReference}</span>}
            </div>

            {t.notes && <p className="mt-2 text-xs text-gray-400">{t.notes}</p>}
          </Card>
        ))}
      </div>
    </div>
  )
}
