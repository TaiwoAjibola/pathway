import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  const { applicantId } = getIds()
  const docs = await prisma.document.findMany({
    where: { applicantId },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(docs)
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { id, status } = body
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 })
  const doc = await prisma.document.update({
    where: { id },
    data: { status },
  })
  return NextResponse.json(doc)
}
