import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  try {
    const { appId } = await getIds()
    const all = await prisma.applicant.findMany({
      where: { applicationId: appId },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(all)
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
