import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds, getApplication } from "@/lib/data"

export async function GET() {
  try {
    const data = await getApplication()
    if (!data) return NextResponse.json({ error: "No application found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { appId } = await getIds()
    const app = await prisma.application.update({
      where: { id: appId },
      data: {
        status: body.status ?? undefined,
        currentStageId: body.currentStageId ?? undefined,
        estimatedCompletionDate: body.estimatedCompletionDate ? new Date(body.estimatedCompletionDate) : undefined,
        metadata: body.metadata ?? undefined,
      },
    })
    return NextResponse.json(app)
  } catch (error) {
    console.error("API PATCH error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
