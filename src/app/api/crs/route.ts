import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { appId } = await getIds()
    const snapshot = await prisma.cRSSnapshot.create({
      data: {
        applicationId: appId,
        totalScore: body.totalScore,
        breakdown: body.breakdown || {},
        ageScore: body.breakdown?.find((b: { category: string }) => b.category === "age")?.score || 0,
        educationScore: body.breakdown?.find((b: { category: string }) => b.category === "education")?.score || 0,
        languageScore: body.breakdown?.find((b: { category: string }) => b.category === "language")?.score || 0,
        workExperienceScore: body.breakdown?.find((b: { category: string }) => b.category === "work")?.score || 0,
        skillsTransferScore: body.breakdown?.find((b: { category: string }) => b.category === "transferability")?.score || 0,
      },
    })

    await prisma.application.update({
      where: { id: appId },
      data: { crsScore: body.totalScore },
    })

    return NextResponse.json(snapshot, { status: 201 })
  } catch (error) {
    console.error("API POST error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
