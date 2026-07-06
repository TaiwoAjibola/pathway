import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  try {
    const { applicantId } = getIds()
    const docs = await prisma.document.findMany({
      where: { applicantId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(docs)
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, status } = body
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 })
    const doc = await prisma.document.update({
      where: { id },
      data: { status },
    })
    return NextResponse.json(doc)
  } catch (error) {
    console.error("API PATCH error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
