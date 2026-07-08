import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  try {
    const { appId } = await getIds()
    const stages = await prisma.applicationStage.findMany({
      where: { applicationId: appId },
      include: {
        stage: true,
        groups: {
          include: {
            tasks: {
              include: {
                assignees: { include: { applicant: { select: { id: true, firstName: true, lastName: true, type: true } } } },
                dependencies: {
                  include: { dependsOn: { select: { id: true, title: true, status: true } } },
                },
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
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
