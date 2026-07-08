import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET(req: Request) {
  try {
    const { appId } = await getIds()
    const { searchParams } = new URL(req.url)
    const includeTasks = searchParams.get("include") === "tasks"

    if (includeTasks) {
      const [stages, groups, tasks, assignees] = await Promise.all([
        prisma.applicationStage.findMany({
          where: { applicationId: appId },
          include: { stage: true },
          orderBy: { stage: { order: "asc" } },
        }),
        prisma.taskGroup.findMany({
          where: { applicationStage: { applicationId: appId } },
          orderBy: { order: "asc" },
        }),
        prisma.taskInstance.findMany({
          where: { applicationId: appId },
          include: {
            assignees: { include: { applicant: { select: { id: true, firstName: true, lastName: true } } } },
            dependencies: { include: { dependsOn: { select: { id: true, title: true, status: true } } } },
          },
          orderBy: { order: "asc" },
        }),
        prisma.applicant.findMany({
          where: { applicationId: appId },
          select: { id: true, firstName: true, lastName: true, type: true },
        }),
      ])

      const groupMap = new Map<string, typeof groups>()
      for (const g of groups) {
        const list = groupMap.get(g.applicationStageId) || []
        list.push(g)
        groupMap.set(g.applicationStageId, list)
      }

      const taskMap = new Map<string, typeof tasks>()
      for (const t of tasks) {
        const list = taskMap.get(t.groupId || "__ungrouped__") || []
        list.push(t)
        taskMap.set(t.groupId || "__ungrouped__", list)
      }

      const stagesWithGroups = stages.map(s => {
        const sGroups = groupMap.get(s.id) || []
        return {
          ...s,
          groups: sGroups.map(g => ({
            ...g,
            tasks: taskMap.get(g.id) || [],
          })),
        }
      })

      return NextResponse.json({ stages: stagesWithGroups, applicants: assignees })
    }

    // Lightweight: just stages with timeline data, no groups/tasks
    const stages = await prisma.applicationStage.findMany({
      where: { applicationId: appId },
      include: { stage: { select: { id: true, code: true, name: true, description: true, order: true } } },
      orderBy: { stage: { order: "asc" } },
    })
    return NextResponse.json(stages)
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const updateData: Record<string, unknown> = {}
    if (data.status) updateData.status = data.status
    if (data.progress !== undefined) updateData.progress = data.progress
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null
    if (data.duration !== undefined) updateData.duration = data.duration ? parseInt(data.duration) : null
    if (data.notes !== undefined) updateData.notes = data.notes

    const stage = await prisma.applicationStage.update({ where: { id }, data: updateData })
    return NextResponse.json(stage)
  } catch (error) {
    console.error("API PATCH error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
