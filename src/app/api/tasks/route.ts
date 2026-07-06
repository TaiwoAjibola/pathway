import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"
import type { Prisma } from "@prisma/client"

export async function GET() {
  const { appId } = getIds()
  const tasks = await prisma.taskInstance.findMany({
    where: { applicationId: appId },
    include: { applicant: { select: { id: true, firstName: true, lastName: true, type: true } } },
    orderBy: [{ dueDate: "asc" }, { priority: "asc" }],
  })
  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  const { appId } = getIds()
  const body = await req.json()
  const task = await prisma.taskInstance.create({
    data: {
      applicationId: appId,
      applicantId: body.applicantId || null,
      templateId: body.templateId || "manual",
      stageId: body.stageId || "",
      title: body.title,
      description: body.description || null,
      priority: body.priority || "MEDIUM",
      difficulty: body.difficulty || "MODERATE",
      estimatedTimeMinutes: body.estimatedTimeMinutes || 30,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      status: body.status || "NOT_STARTED",
      metadata: body.metadata as Prisma.InputJsonValue | undefined,
    },
  })
  return NextResponse.json(task, { status: 201 })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const updateData: Record<string, unknown> = {}
  if (data.status) updateData.status = data.status
  if (data.title) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.priority) updateData.priority = data.priority
  if (data.applicantId !== undefined) updateData.applicantId = data.applicantId || null
  if (data.stageId !== undefined) updateData.stageId = data.stageId
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
  if (data.status === "COMPLETED") updateData.completedDate = new Date()
  if (data.metadata !== undefined) updateData.metadata = data.metadata as Prisma.InputJsonValue

  const task = await prisma.taskInstance.update({ where: { id }, data: updateData })
  return NextResponse.json(task)
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  await prisma.taskInstance.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
