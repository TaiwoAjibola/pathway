import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"
import type { Prisma } from "@prisma/client"

export async function GET() {
  try {
    const { appId } = await getIds()
    const tasks = await prisma.taskInstance.findMany({
      where: { applicationId: appId },
      include: { assignees: { include: { applicant: { select: { id: true, firstName: true, lastName: true, type: true } } } } },
      orderBy: [{ dueDate: "asc" }, { priority: "asc" }],
    })
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { appId } = await getIds()
    const body = await req.json()
    const task = await prisma.taskInstance.create({
      data: {
        applicationId: appId,
        stageId: body.stageId || "",
        title: body.title,
        taskType: body.taskType || "OTHER",
        category: body.category || null,
        description: body.description || null,
        priority: body.priority || "MEDIUM",
        progress: body.progress ?? 0,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: body.status || "NOT_STARTED",
        estimatedCost: body.estimatedCost ? parseFloat(body.estimatedCost) : null,
        actualCost: body.actualCost ? parseFloat(body.actualCost) : null,
        currency: body.currency || "CAD",
        paid: body.paid ?? false,
        outstanding: body.outstanding ? parseFloat(body.outstanding) : null,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        receiptUrl: body.receiptUrl || null,
        evidence: body.evidence || null,
        metadata: body.metadata as Prisma.InputJsonValue | undefined,
      },
    })

    if (body.assigneeIds?.length > 0) {
      await prisma.taskAssignee.createMany({
        data: body.assigneeIds.map((applicantId: string) => ({
          taskId: task.id,
          applicantId,
        })),
      })
    }

    const created = await prisma.taskInstance.findUnique({
      where: { id: task.id },
      include: { assignees: { include: { applicant: true } } },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("API POST error:", error)
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
    if (data.title) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.priority) updateData.priority = data.priority
    if (data.taskType) updateData.taskType = data.taskType
    if (data.category !== undefined) updateData.category = data.category
    if (data.stageId !== undefined) updateData.stageId = data.stageId
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
    if (data.status === "COMPLETED") updateData.completedDate = new Date()
    if (data.progress !== undefined) updateData.progress = data.progress
    if (data.estimatedCost !== undefined) updateData.estimatedCost = data.estimatedCost
    if (data.actualCost !== undefined) updateData.actualCost = data.actualCost
    if (data.currency !== undefined) updateData.currency = data.currency
    if (data.paid !== undefined) updateData.paid = data.paid
    if (data.outstanding !== undefined) updateData.outstanding = data.outstanding
    if (data.paymentDate !== undefined) updateData.paymentDate = data.paymentDate ? new Date(data.paymentDate) : null
    if (data.receiptUrl !== undefined) updateData.receiptUrl = data.receiptUrl
    if (data.evidence !== undefined) updateData.evidence = data.evidence
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.metadata !== undefined) updateData.metadata = data.metadata as Prisma.InputJsonValue

    const task = await prisma.taskInstance.update({ where: { id }, data: updateData })

    if (data.assigneeIds) {
      await prisma.taskAssignee.deleteMany({ where: { taskId: id } })
      if (data.assigneeIds.length > 0) {
        await prisma.taskAssignee.createMany({
          data: data.assigneeIds.map((applicantId: string) => ({ taskId: id, applicantId })),
        })
      }
    }

    const updated = await prisma.taskInstance.findUnique({
      where: { id },
      include: { assignees: { include: { applicant: true } } },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("API PATCH error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    await prisma.taskInstance.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API DELETE error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
