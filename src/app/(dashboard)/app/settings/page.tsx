"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save } from "lucide-react"

type User = {
  id: string
  name: string | null
  email: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      setUser(d)
      setName(d.name || "")
      setEmail(d.email || "")
    }).catch(console.error).finally(() => setLoading(false))
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

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and preferences</p>
      </div>

      <Card>
        <CardTitle>Profile</CardTitle>
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
