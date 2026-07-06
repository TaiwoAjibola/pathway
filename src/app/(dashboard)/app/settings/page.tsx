"use client"

import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bell, Shield, Globe, Palette, Users, Download, Trash2 } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <Card className="lg:col-span-2">
          <CardTitle>Profile</CardTitle>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First Name" defaultValue="John" />
              <Input label="Last Name" defaultValue="Doe" />
            </div>
            <Input label="Email" type="email" defaultValue="john@example.com" />
            <Input label="Phone" type="tel" defaultValue="+1 (555) 123-4567" />
            <div className="flex gap-2">
              <Button>Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </Card>

        {/* Subscription & Account */}
        <div className="space-y-6">
          <Card>
            <CardTitle>Subscription</CardTitle>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Pathway Pro</p>
                  <p className="text-xs text-gray-500">Active until Dec 2026</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full">Manage Plan</Button>
            </div>
          </Card>

          <Card>
            <CardTitle>Current Pathway</CardTitle>
            <div className="mt-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇨🇦</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Canada PR</p>
                  <p className="text-xs text-gray-500">Express Entry (FSW)</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full">Switch Pathway</Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Preferences sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
          <div className="mt-4 space-y-3">
            {[
              { label: "Task reminders", enabled: true },
              { label: "Document expiry alerts", enabled: true },
              { label: "Draw notifications", enabled: true },
              { label: "Policy change alerts", enabled: false },
              { label: "Weekly progress summary", enabled: true },
              { label: "AI Coach suggestions", enabled: true },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{n.label}</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" defaultChecked={n.enabled} className="peer sr-only" />
                  <div className="h-5 w-9 rounded-full bg-gray-300 after:absolute after:top-0.5 after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Account & Data
          </CardTitle>
          <div className="mt-4 space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4" />
              Export My Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Globe className="h-4 w-4" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Palette className="h-4 w-4" />
              Theme: System
            </Button>
            <Button variant="danger" className="w-full justify-start">
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
