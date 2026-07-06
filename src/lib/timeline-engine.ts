import type { TimelineItem } from "@/types"
import { addDays, differenceInDays, format } from "date-fns"

interface StageTimeline {
  id: string
  name: string
  order: number
  tasks: TaskTimeline[]
  completed: boolean
}

interface TaskTimeline {
  id: string
  title: string
  status: string
  priority: string
  estimatedTimeMinutes: number
  completedDate?: string
  dueDate?: string
  dependencies: string[]
}

interface TimelineInput {
  stages: StageTimeline[]
  completedTaskIds: string[]
  startDate: Date
  velocity: number
}

interface GeneratedTimeline {
  items: TimelineItem[]
  milestones: { stage: string; estimatedStart: string; estimatedEnd: string; progress: number }[]
  criticalPath: string[]
  estimatedCompletion: string
  risks: { type: string; severity: string; description: string }[]
}

export function generateTimeline(input: TimelineInput): GeneratedTimeline {
  const completedIds = new Set(input.completedTaskIds)
  const velocity = input.velocity > 0 ? input.velocity : 1 // tasks per day

  const items: TimelineItem[] = []
  const milestones: GeneratedTimeline["milestones"] = []
  const risks: GeneratedTimeline["risks"] = []
  const criticalPath: string[] = []

  let currentDate = new Date(input.startDate)
  let totalRemainingMinutes = 0
  let allCompleted = true

  for (const stage of input.stages) {
    let stageStart = new Date(currentDate)
    let stageEnd = new Date(currentDate)
    let stageCompletedTasks = 0
    let stageTotalTasks = 0

    for (const task of stage.tasks) {
      stageTotalTasks++
      if (completedIds.has(task.id)) {
        stageCompletedTasks++
        continue
      }

      allCompleted = false

      const taskStart = new Date(currentDate)
      const durationDays = Math.max(1, Math.ceil(task.estimatedTimeMinutes / 60 / 8))
      const taskEnd = addDays(taskStart, durationDays)

      totalRemainingMinutes += task.estimatedTimeMinutes

      const isCritical = task.priority === "CRITICAL" || task.dependencies.length > 0

      items.push({
        type: "task",
        id: task.id,
        title: task.title,
        startDate: taskStart.toISOString(),
        endDate: taskEnd.toISOString(),
        status: task.status,
        isCritical,
      })

      if (isCritical && !completedIds.has(task.id)) {
        criticalPath.push(task.id)
      }

      currentDate = taskEnd

      if (task.dueDate) {
        const due = new Date(task.dueDate)
        if (taskEnd > due) {
          risks.push({
            type: "SCHEDULE_RISK",
            severity: "HIGH",
            description: `${task.title} estimated to finish after due date of ${format(due, "MMM d, yyyy")}`,
          })
        }
      }

      if (task.dependencies.length > 0) {
        const depCompleted = task.dependencies.every((d) => completedIds.has(d))
        if (!depCompleted) {
          risks.push({
            type: "DEPENDENCY_BLOCKER",
            severity: "HIGH",
            description: `${task.title} waiting on ${task.dependencies.length} incomplete dependencies`,
          })
        }
      }
    }

    stageEnd = new Date(currentDate)

    const stageProgress = stageTotalTasks > 0 ? Math.round((stageCompletedTasks / stageTotalTasks) * 100) : 0

    milestones.push({
      stage: stage.name,
      estimatedStart: stageStart.toISOString(),
      estimatedEnd: stageEnd.toISOString(),
      progress: stageProgress,
    })

    items.push({
      type: "milestone",
      id: stage.id,
      title: `${stage.name} Complete`,
      startDate: stageStart.toISOString(),
      endDate: stageEnd.toISOString(),
      status: stage.completed ? "COMPLETED" : "IN_PROGRESS",
      isCritical: false,
      progress: stageProgress,
    })
  }

  const estimatedCompletion = allCompleted
    ? format(new Date(), "MMM d, yyyy")
    : format(currentDate, "MMM d, yyyy")

  const totalDays = differenceInDays(currentDate, input.startDate)

  if (totalDays > 365) {
    risks.push({
      type: "LONG_TIMELINE",
      severity: "MEDIUM",
      description: `Estimated timeline of ${totalDays} days (${Math.round(totalDays / 30)} months)`,
    })
  }

  return {
    items,
    milestones,
    criticalPath,
    estimatedCompletion,
    risks,
  }
}
