export interface CRSBreakdown {
  totalScore: number
  ageScore: number
  educationScore: number
  firstLanguageScore: number
  secondLanguageScore: number
  workExperienceScore: number
  skillsTransferScore: number
  additionalScore: number
  maxPossible: number
  breakdown: CRSFactor[]
}

export interface CRSFactor {
  category: string
  score: number
  maxScore: number
  label: string
}

export interface CRSOpportunity {
  id: string
  label: string
  description: string
  pointsGained: number
  estimatedEffort: string
  difficulty: "EASY" | "MODERATE" | "HARD" | "COMPLEX"
  confidence: "HIGH" | "MEDIUM" | "LOW"
}

export interface CRSProjection {
  currentScore: number
  newScore: number
  pointsGained: number
  changes: WhatIfChange[]
  wouldQualify: boolean
  cutoffComparison?: {
    cutoff: number
    gap: number
  }
}

export interface WhatIfChange {
  field: string
  value: string | number | boolean
  label: string
}

export interface JourneySnapshot {
  currentStage: string
  currentStageProgress: number
  overallProgress: number
  completedTasks: number
  totalTasks: number
  nextActions: NextAction[]
  blockedTasks: BlockedTask[]
  risks: Risk[]
  estimatedCompletion: EstimatedCompletion
  timeline: TimelineItem[]
}

export interface NextAction {
  taskId: string
  title: string
  reason: string
  priority: string
  estimatedTimeMinutes: number
  score: number
}

export interface BlockedTask {
  taskId: string
  title: string
  blocker: string
  unblockAction?: string
}

export interface Risk {
  type: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  description: string
  actionRequired?: string
  dueDate?: string
}

export interface EstimatedCompletion {
  date: Date
  daysRemaining: number
  confidence: "HIGH" | "MEDIUM" | "LOW"
}

export interface TimelineItem {
  type: "task" | "milestone" | "stage"
  id: string
  title: string
  startDate: string
  endDate: string
  status: string
  isCritical: boolean
  progress?: number
}

export interface DrawData {
  date: string
  program: string
  cutoff: number
  invitations: number
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  todayStudied: boolean
  weeklyActivity: { date: string; studied: boolean }[]
}

export interface StudyPlan {
  weeks: StudyWeek[]
  dailyRecommendation: {
    timeRequired: number
    focusAreas: string[]
    exercises: string[]
  }
}

export interface StudyWeek {
  week: number
  focus: string
  tasks: string[]
  hoursRequired: number
}

export interface LanguageScores {
  listening: number
  reading: number
  writing: number
  speaking: number
  overall?: number
}

export interface HealthScoreFactors {
  overdueCriticalTasks: number
  overdueHighTasks: number
  expiredDocuments: number
  expiringDocuments: number
  crsBelowTarget: number
  stagnationDays: number
  missingCriticalDocs: number
  blockedTasksUnresolved: number
  aheadOfSchedule: boolean
  consecutiveWeeklyProgress: number
  allNonDependentTasksComplete: boolean
}

export interface JourneyMetrics {
  completionPercent: number
  journeyVelocity: number
  averageWeeklyProgress: number
  stageBreakdown: { stage: string; progress: number }[]
  tasksCompleted: number
  tasksOverdue: number
  tasksBlocked: number
  documentCompletion: number
  projectedSubmissionDate: string
  daysRemaining: number
  isOnTrack: boolean
  delayRisk: "LOW" | "MEDIUM" | "HIGH"
  readinessScore: number
}
