"use client"

import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, daysUntil, getPriorityColor, getStatusColor, getStatusLabel } from "@/lib/utils"
import { calculateCRS, identifyOpportunities } from "@/lib/crs-engine"
import { evaluateJourney, computeHealthScore } from "@/lib/journey-engine"
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trophy,
  TrendingUp,
  Target,
  Sparkles,
  FileText,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts"
import type { CRSBreakdown, CRSOpportunity } from "@/types"

interface DashboardClientProps {
  userName: string
}

const mockTasks = [
  { id: "1", title: "Submit WES Application", status: "NOT_STARTED", priority: "CRITICAL", dependencies: [], estimatedTimeMinutes: 120, dueDate: "2026-07-10" },
  { id: "2", title: "Book IELTS Test", status: "IN_PROGRESS", priority: "HIGH", dependencies: [], estimatedTimeMinutes: 30, dueDate: "2026-07-20" },
  { id: "3", title: "Gather Employment Reference Letters", status: "NOT_STARTED", priority: "HIGH", dependencies: [], estimatedTimeMinutes: 180, dueDate: "2026-07-25" },
  { id: "4", title: "Complete FSW 67 Eligibility Quiz", status: "COMPLETED", priority: "MEDIUM", dependencies: [], estimatedTimeMinutes: 15, dueDate: "2026-07-05" },
  { id: "5", title: "Upload Passport Copy", status: "COMPLETED", priority: "MEDIUM", dependencies: [], estimatedTimeMinutes: 10, dueDate: "2026-07-03" },
  { id: "6", title: "Gather Education Documents", status: "COMPLETED", priority: "HIGH", dependencies: [], estimatedTimeMinutes: 60, dueDate: "2026-07-02" },
  { id: "7", title: "Receive ECA Report", status: "WAITING", priority: "CRITICAL", dependencies: ["1"], estimatedTimeMinutes: 0, dueDate: "2026-09-01" },
  { id: "8", title: "Take IELTS Exam", status: "NOT_STARTED", priority: "CRITICAL", dependencies: ["2"], estimatedTimeMinutes: 180, dueDate: "2026-08-20" },
]

const mockStages = [
  { id: "s1", code: "planning", name: "Planning", order: 1, tasks: mockTasks.filter(t => ["5", "6"].includes(t.id)), estimatedDurationDays: 3 },
  { id: "s2", code: "eligibility", name: "Eligibility", order: 2, tasks: [mockTasks[3]], estimatedDurationDays: 7 },
  { id: "s3", code: "documents", name: "Documents", order: 3, tasks: [mockTasks[4], mockTasks[5]], estimatedDurationDays: 14 },
  { id: "s4", code: "credential-assessment", name: "Credential Assessment", order: 4, tasks: mockTasks.filter(t => ["1", "7"].includes(t.id)), estimatedDurationDays: 60 },
  { id: "s5", code: "language-tests", name: "Language Tests", order: 5, tasks: mockTasks.filter(t => ["2", "8"].includes(t.id)), estimatedDurationDays: 45 },
  { id: "s6", code: "employment", name: "Employment Verification", order: 6, tasks: [mockTasks[2]], estimatedDurationDays: 30 },
]

const mockJourney = evaluateJourney({
  id: "app-1",
  currentStageCode: "credential-assessment",
  stages: mockStages,
  allTasks: mockTasks,
  completedTaskIds: ["5", "6", "3", "4"],
  startDate: new Date("2026-06-01"),
})

const mockCRSInput = {
  age: 29,
  educationLevel: "MASTERS",
  firstLanguage: { listening: 7.5, reading: 7.0, writing: 6.5, speaking: 7.0 },
  canadianWorkExperienceYears: 0,
  foreignWorkExperienceYears: 3,
  hasPNPNomination: false,
  hasJobOfferLMIA: false,
  hasCanadianEducation: false,
  hasCanadianSibling: false,
  hasFrenchAbility: false,
}

const mockHealth = computeHealthScore({
  overdueCriticalTasks: 0,
  overdueHighTasks: 0,
  expiredDocuments: 0,
  expiringDocuments: 1,
  crsBelowTarget: 14,
  stagnationDays: 0,
  missingCriticalDocs: 1,
  blockedTasksUnresolved: 0,
  aheadOfSchedule: false,
  consecutiveWeeklyProgress: 3,
  allNonDependentTasksComplete: false,
})

const weeklyData = [
  { week: "Jun 1", tasks: 3 },
  { week: "Jun 8", tasks: 5 },
  { week: "Jun 15", tasks: 4 },
  { week: "Jun 22", tasks: 6 },
  { week: "Jun 29", tasks: 4 },
  { week: "Jul 6", tasks: 2 },
]

const crsTrendData = [
  { month: "Jan", score: 440 },
  { month: "Feb", score: 442 },
  { month: "Mar", score: 445 },
  { month: "Apr", score: 450 },
  { month: "May", score: 453 },
  { month: "Jun", score: 456 },
]

export function DashboardClient({ userName }: DashboardClientProps) {
  const crs = calculateCRS(mockCRSInput)
  const opportunities = identifyOpportunities(mockCRSInput)
  const currentStageTasks = mockTasks.filter((t) => t.status !== "COMPLETED")

  const healthStatus = mockHealth.status === "EXCELLENT" ? "text-green-600" :
    mockHealth.status === "GOOD" ? "text-blue-600" :
    mockHealth.status === "AT_RISK" ? "text-yellow-600" : "text-red-600"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {userName}
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Canada PR — Express Entry (FSW) &middot; Started Jun 1, 2026
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{mockJourney.overallProgress}%</p>
            </div>
            <ProgressRing progress={mockJourney.overallProgress} size={64} strokeWidth={6} />
          </div>
          <ProgressBar progress={mockJourney.overallProgress} size="sm" className="mt-3" />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Health Score</p>
              <p className={`text-2xl font-bold ${healthStatus}`}>{mockHealth.score}</p>
            </div>
            <div className={`rounded-full p-3 ${
              mockHealth.status === "EXCELLENT" ? "bg-green-100 text-green-600" :
              mockHealth.status === "GOOD" ? "bg-blue-100 text-blue-600" :
              "bg-yellow-100 text-yellow-600"
            }`}>
              <Trophy className="h-6 w-6" />
            </div>
          </div>
          <Badge variant={
            mockHealth.status === "EXCELLENT" ? "success" :
            mockHealth.status === "GOOD" ? "info" :
            "warning"
          } className="mt-2">
            {getStatusLabel(mockHealth.status)}
          </Badge>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Stage</p>
              <p className="text-lg font-semibold text-gray-900">{mockJourney.currentStage}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <Target className="h-6 w-6" />
            </div>
          </div>
          <ProgressBar progress={mockJourney.currentStageProgress} size="sm" className="mt-3" />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Est. Completion</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(mockJourney.estimatedCompletion.date)}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {mockJourney.estimatedCompletion.daysRemaining} days remaining
          </p>
        </Card>
      </div>

      {/* Main Grid: Left (Tasks + AI) / Right (CRS + Timeline) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* AI Recommendation */}
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-900 dark:text-blue-100">AI Coach Recommendation</p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  Submit your WES application this week — it&apos;s on the critical path and takes 6-12 weeks.
                  You could improve your CRS by 24 points by learning French (NCLC 7).
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm">Start WES Application</Button>
                  <Button size="sm" variant="outline">Explore French Options</Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Today's Tasks */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>Today&apos;s Tasks</CardTitle>
              <Badge variant="warning">{currentStageTasks.length} remaining</Badge>
            </div>
            <div className="mt-4 space-y-2">
              {currentStageTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700"
                >
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(task.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">
                          Due {formatDate(task.dueDate)}
                          {daysUntil(task.dueDate) <= 7 && daysUntil(task.dueDate) >= 0 && (
                            <span className="ml-1 text-yellow-600">({daysUntil(task.dueDate)}d left)</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {task.status === "NOT_STARTED" && (
                    <Button size="sm" variant="outline">
                      Start <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                  {task.status === "IN_PROGRESS" && (
                    <Button size="sm" variant="primary">
                      Complete
                    </Button>
                  )}
                  {task.status === "WAITING" && (
                    <Badge variant="warning">Waiting</Badge>
                  )}
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-3 w-full">
              View All Tasks <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Card>

          {/* Journey Map */}
          <Card>
            <CardTitle>Journey Progress</CardTitle>
            <div className="mt-4 space-y-3">
              {mockStages.map((stage, i) => {
                const stageTasks = stage.tasks
                const completed = stageTasks.filter((t) => t.status === "COMPLETED").length
                const progress = stageTasks.length > 0 ? (completed / stageTasks.length) * 100 : 0
                const isCurrent = stage.code === "credential-assessment"
                const isComplete = progress === 100

                return (
                  <div key={stage.id} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                          isComplete
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-2 dark:ring-offset-gray-900"
                            : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {isComplete ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                      </div>
                      {i < mockStages.length - 1 && (
                        <div
                          className={`mt-1 h-6 w-0.5 ${
                            isComplete ? "bg-green-500" : isCurrent ? "bg-blue-300" : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        isCurrent
                          ? "text-blue-700 dark:text-blue-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`}>
                        {stage.name}
                        {isCurrent && <Badge variant="info" className="ml-2">In Progress</Badge>}
                      </p>
                      {stageTasks.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {completed} of {stageTasks.length} tasks complete
                        </p>
                      )}
                      <ProgressBar progress={progress} size="sm" className="mt-1" />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* CRS Score */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>CRS Score</CardTitle>
              <Badge variant="warning">{crs.totalScore} / {crs.maxPossible}</Badge>
            </div>
            <div className="mt-4 text-center">
              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{crs.totalScore}</p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <p className="text-sm text-gray-500">Target: 470+</p>
                <span className="text-sm font-medium text-red-500">Gap: {470 - crs.totalScore}</span>
              </div>
              <ProgressBar progress={(crs.totalScore / 470) * 100} size="sm" className="mt-2" barClassName="bg-orange-500" />
            </div>

            <div className="mt-4 space-y-2">
              {crs.breakdown.slice(0, 4).map((factor) => (
                <div key={factor.category} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{factor.label}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {factor.score}/{factor.maxScore}
                  </span>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="mt-4 w-full">
              Improve Your Score <TrendingUp className="ml-1 h-4 w-4" />
            </Button>
          </Card>

          {/* CRS Opportunities */}
          <Card>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Biggest Opportunities
              </span>
            </CardTitle>
            <div className="mt-3 space-y-3">
              {opportunities.slice(0, 4).map((opp) => (
                <div key={opp.id} className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{opp.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opp.estimatedEffort}</p>
                    </div>
                    <Badge variant="success">+{opp.pointsGained}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">WES Application</p>
                  <p className="text-xs text-red-600">Due Jul 10 · 4 days left</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Book IELTS Test</p>
                  <p className="text-xs text-yellow-600">Due Jul 20 · 14 days left</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Employment Reference Letters</p>
                  <p className="text-xs text-blue-600">Due Jul 25 · 19 days left</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Document Status */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>Documents</CardTitle>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploaded</span>
                <span className="font-medium text-green-600">12/18</span>
              </div>
              <ProgressBar progress={67} size="sm" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Approved</span>
                <span className="font-medium">8/12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Expiring Soon</span>
                <span className="font-medium text-yellow-600">1</span>
              </div>
            </div>
          </Card>

          {/* Weekly Activity Chart */}
          <Card>
            <CardTitle>Weekly Tasks</CardTitle>
            <div className="mt-3 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row: CRS Trend + Velocity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>CRS Score Trend</CardTitle>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={crsTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[430, 480]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardTitle>Readiness Breakdown</CardTitle>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Documents</span>
                <span className="font-medium">67%</span>
              </div>
              <ProgressBar progress={67} size="sm" barClassName="bg-blue-500" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Language</span>
                <span className="font-medium">45%</span>
              </div>
              <ProgressBar progress={45} size="sm" barClassName="bg-yellow-500" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Financial</span>
                <span className="font-medium">90%</span>
              </div>
              <ProgressBar progress={90} size="sm" barClassName="bg-green-500" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Credentials</span>
                <span className="font-medium">50%</span>
              </div>
              <ProgressBar progress={50} size="sm" barClassName="bg-purple-500" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
