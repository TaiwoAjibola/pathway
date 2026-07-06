import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  try {
    const { appId } = getIds()
    const stages = await prisma.applicationStage.findMany({
      where: { applicationId: appId },
      include: { stage: true },
      orderBy: { stage: { order: "asc" } },
    })
    return NextResponse.json(stages)
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
