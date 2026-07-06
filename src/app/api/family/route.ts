import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"
import { randomBytes } from "crypto"

export async function GET() {
  try {
    const { appId } = await getIds()
    if (!appId) return NextResponse.json([], { status: 200 })
    const members = await prisma.familyMember.findMany({
      where: { applicationId: appId },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(members)
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { appId } = await getIds()
    if (!appId) return NextResponse.json({ error: "No application found" }, { status: 404 })
    const inviteCode = randomBytes(6).toString("hex")
    const member = await prisma.familyMember.create({
      data: {
        applicationId: appId,
        name: body.name,
        email: body.email,
        role: body.role || "VIEWER",
        inviteCode,
      },
    })
    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("API POST error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    await prisma.familyMember.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API DELETE error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
