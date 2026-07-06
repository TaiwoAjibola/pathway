"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, Share2, Copy, Check, UserPlus, X, Mail, Shield } from "lucide-react"

type User = { id: string; name: string | null; email: string }

type FamilyMember = {
  id: string
  name: string
  email: string | null
  role: "VIEWER" | "EDITOR"
  inviteCode: string | null
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [shareUrl, setShareUrl] = useState("")
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberEmail, setNewMemberEmail] = useState("")

  async function loadFamily() {
    try {
      const res = await fetch("/api/family")
      const data = await res.json()
      setFamilyMembers(data)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    setShareUrl(window.location.origin)
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      setUser(d)
      setName(d.name || "")
      setEmail(d.email || "")
    }).catch(console.error).finally(() => setLoading(false))
    loadFamily()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  async function addMember() {
    if (!newMemberName.trim()) return
    await fetch("/api/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newMemberName.trim(),
        email: newMemberEmail.trim() || null,
      }),
    })
    setNewMemberName("")
    setNewMemberEmail("")
    await loadFamily()
  }

  async function removeMember(id: string) {
    await fetch(`/api/family?id=${id}`, { method: "DELETE" })
    await loadFamily()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and share your journey with family</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Profile</CardTitle>
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4" />
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Share Journey</CardTitle>
                <CardDescription>Share your Canada PR progress with family members</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" readOnly value={shareUrl}
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
              <Button variant="outline" onClick={copyUrl}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Share this link with family so they can follow your Express Entry journey.
            </p>
          </Card>

          <Card>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Family Members
            </CardTitle>
            <div className="mt-4 space-y-3">
              {familyMembers.length > 0 && (
                <div className="space-y-2">
                  {familyMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-800">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          {m.email && <p className="text-xs text-gray-500">{m.email}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={m.role === "EDITOR" ? "info" : "outline"}>
                          {m.role === "EDITOR" ? "Editor" : "Viewer"}
                        </Badge>
                        <button onClick={() => removeMember(m.id)} className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <Input label="Name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Family member's name" />
                <Input label="Email (optional)" type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="email@example.com" />
                <Button onClick={addMember} disabled={!newMemberName.trim()}>
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
