"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Baby, Heart, Plus, Loader2, Save, X } from "lucide-react"

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState({ type: "SPOUSE", firstName: "", lastName: "", dateOfBirth: "", nationality: "", countryOfResidence: "" })
  const [editForm, setEditForm] = useState<Record<string, string>>({})

  const load = () => {
    fetch("/api/family").then((r) => r.json()).then((d) => {
      setApplicants(d)
      if (d.length > 0 && !selectedId) setSelectedId(d[0].id as string)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const selected = applicants.find((a) => a.id === selectedId)

  async function addMember(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/applicant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowAdd(false)
    setForm({ type: "SPOUSE", firstName: "", lastName: "", dateOfBirth: "", nationality: "", countryOfResidence: "" })
    load()
  }

  async function saveEdit() {
    await fetch("/api/applicant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    })
    load()
  }

  function selectApplicant(a: Record<string, unknown>) {
    setSelectedId(a.id as string)
    setEditForm({
      firstName: a.firstName as string || "",
      lastName: a.lastName as string || "",
      dateOfBirth: a.dateOfBirth ? new Date(a.dateOfBirth as string).toISOString().split("T")[0] : "",
      nationality: a.nationality as string || "",
      countryOfResidence: a.countryOfResidence as string || "",
      maritalStatus: a.maritalStatus as string || "SINGLE",
      email: a.email as string || "",
      phone: a.phone as string || "",
    })
  }

  const iconMap: Record<string, typeof User> = { PRIMARY: User, SPOUSE: Heart, CHILD: Baby }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Family Members</h1>
          <p className="mt-1 text-sm text-gray-500">Manage everyone on your application</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4" /> {showAdd ? "Cancel" : "Add Member"}
        </Button>
      </div>

      {showAdd && (
        <Card className="border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <CardTitle>Add Family Member</CardTitle>
            <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <form onSubmit={addMember} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                  <option value="SPOUSE">Spouse</option>
                  <option value="CHILD">Child</option>
                </select>
              </div>
              <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              <Input label="Nationality" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
              <Input label="Country of Residence" value={form.countryOfResidence} onChange={(e) => setForm({ ...form, countryOfResidence: e.target.value })} />
            </div>
            <Button type="submit" loading={saving}><Save className="h-4 w-4" /> Add Member</Button>
          </form>
        </Card>
      )}

      {/* Family cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {applicants.map((a) => {
          const Icon = iconMap[a.type as string] || User
          const isSelected = selectedId === a.id
          return (
            <Card key={a.id as string}
              className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-blue-500" : "hover:border-blue-300"}`}
              onClick={() => selectApplicant(a)}>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  a.type === "PRIMARY" ? "bg-blue-100 text-blue-600" : a.type === "SPOUSE" ? "bg-pink-100 text-pink-600" : "bg-green-100 text-green-600"
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{a.firstName as string} {a.lastName as string}</p>
                    <Badge variant={a.type === "PRIMARY" ? "info" : a.type === "SPOUSE" ? "success" : "outline"}>
                      {a.type as string}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{a.nationality as string || "N/A"}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Edit selected */}
      {selected && (
        <Card>
          <CardTitle>Edit {selected.firstName as string} {selected.lastName as string}</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="First Name" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
            <Input label="Last Name" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
            <Input label="Date of Birth" type="date" value={editForm.dateOfBirth} onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })} />
            <Input label="Nationality" value={editForm.nationality} onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })} />
            <Input label="Country of Residence" value={editForm.countryOfResidence} onChange={(e) => setEditForm({ ...editForm, countryOfResidence: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
              <select value={editForm.maritalStatus} onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800">
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="COMMON_LAW">Common Law</option>
                <option value="DIVORCED">Divorced</option>
                <option value="SEPARATED">Separated</option>
                <option value="WIDOWED">Widowed</option>
              </select>
            </div>
            <Input label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...form, email: e.target.value })} placeholder={editForm.email || ""} />
            <Input label="Phone" type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...form, phone: e.target.value })} placeholder={editForm.phone || ""} />
          </div>
          <Button onClick={saveEdit} className="mt-4"><Save className="h-4 w-4" /> Save Changes</Button>
        </Card>
      )}
    </div>
  )
}
