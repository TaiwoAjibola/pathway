import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  const { userId } = getIds()
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { userId } = getIds()
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: body.name,
      email: body.email,
    },
  })
  return NextResponse.json(user)
}
