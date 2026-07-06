import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  try {
    const { userId } = await getIds()
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    return NextResponse.json(user)
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { userId } = await getIds()
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        email: body.email,
      },
    })
    return NextResponse.json(user)
  } catch (error) {
    console.error("API PATCH error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
