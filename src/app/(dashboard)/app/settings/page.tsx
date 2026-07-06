"use client"

import { useEffect, useState } from "react"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save, Share2, Copy, Check } from "lucide-react"

type User = { id: string; name: string | null; email: string }

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    setShareUrl(window.location.origin)
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

  async function copyUrl() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and share with family</p>
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
          {/* Share */}
          <Card className="border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Share with Family</CardTitle>
                <CardDescription>Give this link to your wife so she can see progress too</CardDescription>
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
              Anyone with this link can view and update your immigration plan. Share it with your wife to collaborate.
            </p>
          </Card>

          {/* Info */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              How It Works
            </CardTitle>
            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>1. <strong>Add tasks</strong> for each stage of your Express Entry journey</p>
              <p>2. <strong>Add family members</strong> — spouse, children, dependents</p>
              <p>3. <strong>Assign tasks</strong> to each person and set due dates</p>
              <p>4. <strong>Track progress</strong> on the dashboard and timeline</p>
              <p>5. <strong>Share the link</strong> with your wife so you can plan together</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
