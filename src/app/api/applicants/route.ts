import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  try {
    const { appId } = await getIds()
    if (!appId) return NextResponse.json([], { status: 200 })
    const applicants = await prisma.applicant.findMany({
      where: { applicationId: appId },
      orderBy: [{ type: "asc" }, { createdAt: "asc" }],
    })
    return NextResponse.json(applicants)
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
