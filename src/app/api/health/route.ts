import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected`
    const userCount = await prisma.user.count()
    const appCount = await prisma.application.count()
    return NextResponse.json({
      status: "ok",
      database: "connected",
      users: userCount,
      applications: appCount,
      result,
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json({
      status: "error",
      database: "disconnected",
      error: (error as Error).message,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        dbUrlHost: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : "none",
        nodeEnv: process.env.NODE_ENV,
      },
    }, { status: 200 })
  }
}
