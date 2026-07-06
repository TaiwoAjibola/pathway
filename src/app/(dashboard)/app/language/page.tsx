"use client"

import { useState } from "react"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { formatDate, getStatusLabel } from "@/lib/utils"
import { Flame, BookOpen, Target, Calendar, TrendingUp, Star, Trophy } from "lucide-react"

export default function LanguagePage() {
  const [selectedTest, setSelectedTest] = useState("ielts")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Language Tests</h1>
        <p className="mt-1 text-sm text-gray-500">Track preparation, bookings, and results</p>
      </div>

      {/* Streak */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Flame className="h-10 w-10 text-orange-500" />
            <div>
              <p className="text-3xl font-bold text-orange-600">12</p>
              <p className="text-sm text-orange-500">Day Streak</p>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Keep it going! Study today to maintain your streak.</p>
            <div className="mt-2 flex gap-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                <div key={day} className={`h-8 w-8 rounded-md flex items-center justify-center text-xs font-medium ${
                  i < 5 ? "bg-orange-400 text-white" : i === 5 ? "bg-orange-200 text-orange-600" : "bg-gray-200 text-gray-400 dark:bg-gray-700"
                }`}>
                  {day[0]}
                </div>
              ))}
            </div>
          </div>
          <Button variant="primary" className="bg-orange-600 hover:bg-orange-700">Study Now</Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Test Selection & Booking */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardTitle>Your Tests</CardTitle>
            <div className="mt-4 space-y-4">
              {[
                { id: "ielts", name: "IELTS General Training", lang: "English", status: "IN_PROGRESS", score: null, target: "CLB 9", testDate: "Aug 20, 2026" },
                { id: "celpip", name: "CELPIP General", lang: "English", status: "NOT_STARTED", score: null, target: "CLB 9", testDate: null },
                { id: "tef", name: "TEF Canada", lang: "French", status: "NOT_STARTED", score: null, target: "NCLC 7", testDate: null },
                { id: "tcf", name: "TCF Canada", lang: "French", status: "NOT_STARTED", score: null, target: "NCLC 7", testDate: null },
              ].map((test) => (
                <div
                  key={test.id}
                  className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                    selectedTest === test.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedTest(test.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        test.status === "COMPLETED" ? "bg-green-100 text-green-600" :
                        test.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-600" :
                        "bg-gray-100 text-gray-400 dark:bg-gray-800"
                      }`}>
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{test.name}</p>
                        <p className="text-xs text-gray-500">{test.lang} · Target: {test.target}</p>
                      </div>
                    </div>
                    <Badge variant={
                      test.status === "COMPLETED" ? "success" :
                      test.status === "IN_PROGRESS" ? "info" : "outline"
                    }>
                      {getStatusLabel(test.status)}
                    </Badge>
                  </div>
                  {selectedTest === test.id && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {test.testDate && (
                        <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
                          <p className="text-xs text-gray-500">Test Date</p>
                          <p className="text-sm font-medium">{test.testDate}</p>
                        </div>
                      )}
                      <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
                        <p className="text-xs text-gray-500">Target Score</p>
                        <p className="text-sm font-medium">{test.target}</p>
                      </div>
                      <Button size="sm" className="sm:col-span-2">
                        {test.status === "NOT_STARTED" ? "Book This Test" : "View Details"}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Study Plan */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Study Plan — IELTS
            </CardTitle>
            <CardDescription>Personalized 4-week plan based on your target scores</CardDescription>
            <div className="mt-4 space-y-4">
              {[
                { week: 1, focus: "Foundation & Listening", hours: 8, tasks: ["Overview test format", "Listening Section 1-2 practice", "Vocabulary building"] },
                { week: 2, focus: "Reading & Writing Task 1", hours: 10, tasks: ["Skimming and scanning techniques", "Academic Writing Task 1", "Practice tests"] },
                { week: 3, focus: "Writing Task 2 & Speaking", hours: 10, tasks: ["Essay structure and coherence", "Speaking Part 1-2 practice", "Mock tests"] },
                { week: 4, focus: "Full Tests & Review", hours: 12, tasks: ["Full-length practice tests", "Review weak areas", "Test day preparation"] },
              ].map((week) => (
                <div key={week.week} className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Week {week.week}: {week.focus}
                    </p>
                    <Badge variant="outline">{week.hours}h</Badge>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {week.tasks.map((task, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {task}
                      </li>
                    ))}
                  </ul>
                  <ProgressBar progress={week.week === 1 ? 60 : week.week === 2 ? 20 : 0} size="sm" className="mt-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Scores Preview */}
          <Card>
            <CardTitle>Current Scores</CardTitle>
            <div className="mt-4 space-y-3">
              {[
                { skill: "Listening", score: 7.5, target: 8.0, progress: 85 },
                { skill: "Reading", score: 7.0, target: 8.0, progress: 75 },
                { skill: "Writing", score: 6.5, target: 7.5, progress: 60 },
                { skill: "Speaking", score: 7.0, target: 8.0, progress: 70 },
              ].map((item) => (
                <div key={item.skill}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{item.skill}</span>
                    <span className="font-medium">{item.score} / {item.target}</span>
                  </div>
                  <ProgressBar progress={item.progress} size="sm" barClassName="bg-blue-500" />
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Focus on Writing to maximize your score gain. A 1.0 increase adds significant CRS points.
                </p>
              </div>
            </div>
          </Card>

          {/* Resources */}
          <Card>
            <CardTitle>Preparation Resources</CardTitle>
            <div className="mt-3 space-y-2">
              {[
                { name: "IELTS Official Practice", type: "Website", recommended: true },
                { name: "IELTS Liz YouTube Channel", type: "Video", recommended: true },
                { name: "British Council Prep App", type: "App", recommended: false },
                { name: "Cambridge IELTS Books", type: "Books", recommended: true },
              ].map((r) => (
                <div key={r.name} className="flex items-center justify-between rounded-lg border border-gray-100 p-2 dark:border-gray-800">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.type}</p>
                  </div>
                  {r.recommended && <Badge variant="success">Recommended</Badge>}
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Dates */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Key Dates
            </CardTitle>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Book IELTS</p>
                  <p className="text-xs text-red-600">Due Jul 20, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">IELTS Exam</p>
                  <p className="text-xs text-yellow-600">Aug 20, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Results Expected</p>
                  <p className="text-xs text-blue-600">Sep 3, 2026</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
