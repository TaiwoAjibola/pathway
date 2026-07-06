import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  const { appId } = getIds()
  const tasks = await prisma.taskInstance.findMany({
    where: { applicationId: appId },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  })
  return NextResponse.json(tasks)
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id, status } = body
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 })

  const task = await prisma.taskInstance.update({
    where: { id },
    data: {
      status,
      completedDate: status === "COMPLETED" ? new Date() : undefined,
    },
  })
  return NextResponse.json(task)
}
