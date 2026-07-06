import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  try {
    const { applicantId } = await getIds()
    const docs = await prisma.document.findMany({
      where: { applicantId },
      include: { task: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(docs)
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { applicantId } = await getIds()
    const body = await req.json()
    const doc = await prisma.document.create({
      data: {
        applicantId,
        name: body.name,
        description: body.description || null,
        issuingAuthority: body.issuingAuthority || null,
        collected: body.collected ?? false,
        uploaded: body.uploaded ?? false,
        verified: body.verified ?? false,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        notes: body.notes || null,
        taskId: body.taskId || null,
      },
    })
    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error("API POST error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const updateData: Record<string, unknown> = {}
    if (body.collected !== undefined) updateData.collected = body.collected
    if (body.uploaded !== undefined) updateData.uploaded = body.uploaded
    if (body.verified !== undefined) updateData.verified = body.verified
    if (body.name) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.issuingAuthority !== undefined) updateData.issuingAuthority = body.issuingAuthority
    if (body.expiryDate !== undefined) updateData.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.taskId !== undefined) updateData.taskId = body.taskId

    const doc = await prisma.document.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(doc)
  } catch (error) {
    console.error("API PATCH error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
