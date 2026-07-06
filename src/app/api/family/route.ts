import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  const { appId } = getIds()
  const all = await prisma.applicant.findMany({
    where: { applicationId: appId },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(all)
}
