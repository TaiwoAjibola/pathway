import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  try {
    const { applicantId } = getIds()
    const tests = await prisma.languageTest.findMany({
      where: { applicantId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(tests)
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { applicantId } = getIds()
    const test = await prisma.languageTest.create({
      data: {
        applicantId,
        testType: body.testType,
        language: body.language,
        listeningScore: body.listeningScore ? parseFloat(body.listeningScore) : null,
        readingScore: body.readingScore ? parseFloat(body.readingScore) : null,
        writingScore: body.writingScore ? parseFloat(body.writingScore) : null,
        speakingScore: body.speakingScore ? parseFloat(body.speakingScore) : null,
        overallScore: body.overallScore ? parseFloat(body.overallScore) : null,
        testDate: body.testDate ? new Date(body.testDate) : null,
        bookingStatus: body.bookingStatus || "NOT_BOOKED",
        resultStatus: body.resultStatus || "PENDING",
        preparationStatus: body.preparationStatus || "NOT_STARTED",
      },
    })
    return NextResponse.json(test, { status: 201 })
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
    if (data.listeningScore !== undefined) updateData.listeningScore = parseFloat(data.listeningScore)
    if (data.readingScore !== undefined) updateData.readingScore = parseFloat(data.readingScore)
    if (data.writingScore !== undefined) updateData.writingScore = parseFloat(data.writingScore)
    if (data.speakingScore !== undefined) updateData.speakingScore = parseFloat(data.speakingScore)
    if (data.overallScore !== undefined) updateData.overallScore = parseFloat(data.overallScore)
    if (data.testDate !== undefined) updateData.testDate = data.testDate ? new Date(data.testDate) : null
    if (data.bookingStatus) updateData.bookingStatus = data.bookingStatus
    if (data.resultStatus) updateData.resultStatus = data.resultStatus
    if (data.preparationStatus) updateData.preparationStatus = data.preparationStatus

    const test = await prisma.languageTest.update({ where: { id }, data: updateData })
    return NextResponse.json(test)
  } catch (error) {
    console.error("API PATCH error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
