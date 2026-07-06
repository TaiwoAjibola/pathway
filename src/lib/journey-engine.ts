import type { JourneySnapshot, NextAction, BlockedTask, Risk } from "@/types"

interface StageDef {
  id: string
  code: string
  name: string
  order: number
  tasks: TaskDef[]
  estimatedDurationDays: number
}

interface TaskDef {
  id: string
  title: string
  status: string
  priority: string
  estimatedTimeMinutes: number
  dependencies: string[]
  completedDate?: string
  dueDate?: string
}

interface ApplicationState {
  id: string
  currentStageCode: string
  stages: StageDef[]
  allTasks: TaskDef[]
  completedTaskIds: string[]
  startDate: Date
}

const NEXT_ACTION_WEIGHTS = {
  CRITICAL: 100,
  HIGH: 50,
  MEDIUM: 20,
  LOW: 5,
  CRITICAL_PATH: 100,
  ON_CRITICAL_PATH: 50,
  DEP_5_PLUS: 40,
  DEP_2_4: 20,
  DEP_1: 5,
  DUE_7_DAYS: 60,
  DUE_14_DAYS: 30,
  DUE_30_DAYS: 10,
  OVERDUE: 100,
  UNDER_30_MIN: 20,
  UNDER_2_HOURS: 10,
  WAITING_EXTERNAL: -50,
}

function findCriticalPath(tasks: TaskDef[], completedIds: Set<string>): string[] {
  const taskMap = new Map(tasks.map((t) => [t.id, t]))
  const inDegree = new Map<string, number>()
  const graph = new Map<string, string[]>()

  for (const task of tasks) {
    if (!inDegree.has(task.id)) inDegree.set(task.id, 0)
    for (const dep of task.dependencies) {
      if (!graph.has(dep)) graph.set(dep, [])
      graph.get(dep)!.push(task.id)
      inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1)
    }
  }

  const queue: string[] = []
  for (const [id, degree] of inDegree) {
    if (degree === 0 && !completedIds.has(id)) queue.push(id)
  }

  const sorted: string[] = []
  while (queue.length > 0) {
    queue.sort((a, b) => {
      const taskA = taskMap.get(a)!
      const taskB = taskMap.get(b)!
      const priorityWeight = nextActionScore(taskA)
      const priorityWeightB = nextActionScore(taskB)
      return priorityWeightB - priorityWeight
    })
    const node = queue.shift()!
    sorted.push(node)
    for (const neighbor of graph.get(node) || []) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1
      inDegree.set(neighbor, newDegree)
      if (newDegree === 0 && !completedIds.has(neighbor)) queue.push(neighbor)
    }
  }

  return sorted
}

function nextActionScore(task: TaskDef): number {
  let score = 0

  score += NEXT_ACTION_WEIGHTS[task.priority as keyof typeof NEXT_ACTION_WEIGHTS] || 0

  if (task.dueDate) {
    const due = new Date(task.dueDate)
    const now = new Date()
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) score += NEXT_ACTION_WEIGHTS.OVERDUE
    else if (daysUntilDue <= 7) score += NEXT_ACTION_WEIGHTS.DUE_7_DAYS
    else if (daysUntilDue <= 14) score += NEXT_ACTION_WEIGHTS.DUE_14_DAYS
    else if (daysUntilDue <= 30) score += NEXT_ACTION_WEIGHTS.DUE_30_DAYS
  }

  if (task.estimatedTimeMinutes <= 30) score += NEXT_ACTION_WEIGHTS.UNDER_30_MIN
  else if (task.estimatedTimeMinutes <= 120) score += NEXT_ACTION_WEIGHTS.UNDER_2_HOURS

  if (task.dependencies.length > 0) {
    score += NEXT_ACTION_WEIGHTS.DEP_1
  }

  return score
}

export function evaluateJourney(app: ApplicationState): JourneySnapshot {
  const completedIds = new Set(app.completedTaskIds)
  const criticalPath = findCriticalPath(app.allTasks, completedIds)

  const completedTasks = app.completedTaskIds.length
  const totalTasks = app.allTasks.length
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const currentStage = app.stages.find((s) => s.code === app.currentStageCode)
  const currentStageTasks = currentStage?.tasks || []
  const completedStageTasks = currentStageTasks.filter((t) => completedIds.has(t.id)).length
  const stageProgress = currentStageTasks.length > 0
    ? Math.round((completedStageTasks / currentStageTasks.length) * 100)
    : 0

  const notCompletedTasks = app.allTasks.filter((t) => !completedIds.has(t.id) && t.status !== "LOCKED")

  const scored = notCompletedTasks.map((task) => ({
    task,
    score: nextActionScore(task) + (criticalPath.includes(task.id) ? NEXT_ACTION_WEIGHTS.ON_CRITICAL_PATH : 0),
  }))

  scored.sort((a, b) => b.score - a.score)

  const nextActions: NextAction[] = scored.slice(0, 5).map((s) => ({
    taskId: s.task.id,
    title: s.task.title,
    reason: s.task.priority === "CRITICAL" ? "Critical path — blocks progress" : "Next recommended action",
    priority: s.task.priority,
    estimatedTimeMinutes: s.task.estimatedTimeMinutes,
    score: s.score,
  }))

  const blockedTasks: BlockedTask[] = notCompletedTasks
    .filter((t) => t.status === "BLOCKED")
    .map((t) => ({
      taskId: t.id,
      title: t.title,
      blocker: t.dependencies.length > 0 ? "Waiting on dependency" : "Unknown",
      unblockAction: "Complete dependent tasks first",
    }))

  const risks: Risk[] = []
  for (const task of notCompletedTasks) {
    if (task.dueDate) {
      const due = new Date(task.dueDate)
      const now = new Date()
      const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilDue < 0) {
        risks.push({
          type: "OVERDUE_TASK",
          severity: "CRITICAL",
          description: `${task.title} is overdue`,
          actionRequired: "Complete immediately",
          dueDate: task.dueDate,
        })
      } else if (daysUntilDue <= 7) {
        risks.push({
          type: "DUE_SOON",
          severity: "HIGH",
          description: `${task.title} due in ${daysUntilDue} days`,
          actionRequired: "Prioritize this task",
          dueDate: task.dueDate,
        })
      }
    }
  }

  const daysSinceStart = Math.ceil((Date.now() - app.startDate.getTime()) / (1000 * 60 * 60 * 24))
  const velocity = daysSinceStart > 0 ? completedTasks / (daysSinceStart / 7) : 0
  const remainingTasks = totalTasks - completedTasks
  const estimatedWeeksRemaining = velocity > 0 ? remainingTasks / velocity : 12
  const estimatedDate = new Date(Date.now() + estimatedWeeksRemaining * 7 * 24 * 60 * 60 * 1000)

  const timelineItems = criticalPath.slice(0, 10).map((taskId, i) => {
    const task = app.allTasks.find((t) => t.id === taskId)!
    const startDate = new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000)
    const endDate = new Date(startDate.getTime() + task.estimatedTimeMinutes * 60 * 1000)
    return {
      type: "task" as const,
      id: task.id,
      title: task.title,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: task.status,
      isCritical: true,
    }
  })

  return {
    currentStage: currentStage?.name || "Unknown",
    currentStageProgress: stageProgress,
    overallProgress,
    completedTasks,
    totalTasks,
    nextActions,
    blockedTasks,
    risks,
    estimatedCompletion: {
      date: estimatedDate,
      daysRemaining: Math.ceil((estimatedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      confidence: velocity > 1 ? "HIGH" : velocity > 0.5 ? "MEDIUM" : "LOW",
    },
    timeline: timelineItems,
  }
}

export function computeHealthScore(factors: {
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
}): { score: number; status: "EXCELLENT" | "GOOD" | "AT_RISK" | "CRITICAL" } {
  let score = 100

  score -= factors.overdueCriticalTasks * 15
  score -= factors.overdueHighTasks * 8
  score -= factors.expiredDocuments * 20
  score -= factors.expiringDocuments * 10
  score -= factors.crsBelowTarget > 0 ? 15 : 0
  score -= Math.floor(factors.stagnationDays / 7) * 10
  score -= factors.missingCriticalDocs * 12
  score -= Math.floor(factors.blockedTasksUnresolved / 7) * 5

  if (factors.aheadOfSchedule) score += 5
  score += Math.min(factors.consecutiveWeeklyProgress, 5) * 2
  if (factors.allNonDependentTasksComplete) score += 10

  score = Math.max(0, Math.min(100, score))

  const status = score >= 80 ? "EXCELLENT" : score >= 60 ? "GOOD" : score >= 40 ? "AT_RISK" : "CRITICAL"

  return { score, status }
}
