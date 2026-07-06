"use client"

import { useState } from "react"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { User, Heart, Baby, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react"

const applicants = [
  {
    id: "primary",
    type: "Primary Applicant",
    typeIcon: User,
    name: "John Doe",
    dob: "Jan 15, 1997",
    nationality: "Nigeria",
    progress: 68,
    tasksCompleted: 18,
    tasksTotal: 35,
    documentsCompleted: 12,
    documentsTotal: 18,
    status: "active",
  },
  {
    id: "spouse",
    type: "Spouse",
    typeIcon: Heart,
    name: "Jane Doe",
    dob: "Mar 22, 1999",
    nationality: "Nigeria",
    progress: 45,
    tasksCompleted: 8,
    tasksTotal: 20,
    documentsCompleted: 5,
    documentsTotal: 12,
    status: "active",
  },
]

export default function ApplicantsPage() {
  const [selected, setSelected] = useState("primary")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Applicants</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all members of your application</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Applicant
        </Button>
      </div>

      {/* Applicant Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {applicants.map((app) => {
          const isSelected = selected === app.id
          return (
            <Card
              key={app.id}
              className={`cursor-pointer transition-all ${
                isSelected ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelected(app.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    app.id === "primary"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-pink-100 text-pink-600"
                  }`}>
                    <app.typeIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{app.name}</p>
                      <Badge variant="info">{app.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{app.nationality} · Born {app.dob}</p>
                  </div>
                </div>
                {app.status === "active" && <Badge variant="success">Active</Badge>}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Overall Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{app.progress}%</p>
                  <ProgressBar progress={app.progress} size="sm" className="mt-1" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{app.tasksCompleted}/{app.tasksTotal}</p>
                  <ProgressBar progress={(app.tasksCompleted / app.tasksTotal) * 100} size="sm" className="mt-1" />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">Documents: {app.documentsCompleted}/{app.documentsTotal}</span>
                <Button size="sm" variant="outline">View Profile</Button>
              </div>
            </Card>
          )
        })}

        {/* Add new applicant card */}
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center min-h-[200px] cursor-pointer hover:border-blue-400 transition-colors">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">Add Family Member</p>
            <p className="text-xs text-gray-500">Spouse, child, or dependent</p>
          </div>
        </Card>
      </div>

      {/* Selected Applicant Detail */}
      {selected && (
        <Card>
          <CardTitle>
            {applicants.find((a) => a.id === selected)?.name} — Details
          </CardTitle>
          <CardDescription>Personal information, education, and employment</CardDescription>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Personal Information</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">First Name</span>
                  <span className="font-medium">John</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Name</span>
                  <span className="font-medium">Doe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date of Birth</span>
                  <span className="font-medium">Jan 15, 1997</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nationality</span>
                  <span className="font-medium">Nigeria</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Marital Status</span>
                  <span className="font-medium">Married</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Education</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Highest Level</span>
                  <span className="font-medium">Master's Degree</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Field</span>
                  <span className="font-medium">Computer Science</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Institution</span>
                  <span className="font-medium">University of Lagos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Year Completed</span>
                  <span className="font-medium">2021</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Employment</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Job</span>
                  <span className="font-medium">Software Engineer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Company</span>
                  <span className="font-medium">Tech Corp</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Years of Experience</span>
                  <span className="font-medium">3 years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">NOC Code</span>
                  <span className="font-medium">21231 (TEER 1)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button size="sm">Edit Profile</Button>
            <Button size="sm" variant="outline">Add Education</Button>
            <Button size="sm" variant="outline">Add Employment</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
