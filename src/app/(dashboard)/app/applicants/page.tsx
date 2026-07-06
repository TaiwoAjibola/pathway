"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Loader2, Save } from "lucide-react"

type Applicant = {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string | null
  nationality: string | null
  countryOfResidence: string | null
  maritalStatus: string
  email: string | null
  phone: string | null
  type: string
  educationEntries: Array<Record<string, unknown>>
  employmentEntries: Array<Record<string, unknown>>
}

export default function ApplicantsPage() {
  const [applicant, setApplicant] = useState<Applicant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const fetchApplicant = () => {
    fetch("/api/applicant").then((r) => r.json()).then((d) => {
      setApplicant(d)
      setForm({
        firstName: d.firstName || "",
        lastName: d.lastName || "",
        dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth).toISOString().split("T")[0] : "",
        nationality: d.nationality || "",
        countryOfResidence: d.countryOfResidence || "",
        maritalStatus: d.maritalStatus || "SINGLE",
        email: d.email || "",
        phone: d.phone || "",
      })
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(fetchApplicant, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/applicant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    fetchApplicant()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Applicants</h1>
        <p className="mt-1 text-sm text-gray-500">Manage all members of your application</p>
      </div>

      {applicant && (
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{applicant.firstName} {applicant.lastName}</p>
                <Badge variant="info">{applicant.type}</Badge>
              </div>
              <p className="text-sm text-gray-500">{applicant.nationality || "N/A"}</p>
            </div>
          </div>

          <CardTitle>Edit Profile</CardTitle>
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              <Input label="Nationality" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
              <Input label="Country of Residence" value={form.countryOfResidence} onChange={(e) => setForm({ ...form, countryOfResidence: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select value={form.maritalStatus} onChange={(e) => setForm({ ...form, maritalStatus: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="COMMON_LAW">Common Law</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="SEPARATED">Separated</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={saving}><Save className="h-4 w-4" /> {saved ? "Saved!" : "Save Changes"}</Button>
            </div>
          </form>
        </Card>
      )}

      {applicant?.educationEntries && applicant.educationEntries.length > 0 && (
        <Card>
          <CardTitle>Education</CardTitle>
          <div className="mt-4 space-y-3">
            {applicant.educationEntries.map((edu, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                <span className="text-gray-900 font-medium">{edu.field as string || "N/A"}</span>
                <span className="text-gray-500">{edu.level as string} · {edu.institution as string}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {applicant?.employmentEntries && applicant.employmentEntries.length > 0 && (
        <Card>
          <CardTitle>Employment</CardTitle>
          <div className="mt-4 space-y-3">
            {applicant.employmentEntries.map((emp, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                <span className="text-gray-900 font-medium">{emp.title as string}</span>
                <span className="text-gray-500">{emp.company as string} · {emp.durationYears as string} yrs</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
