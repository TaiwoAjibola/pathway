import { NextResponse } from "next/server"
import { getApplication } from "@/lib/data"

export async function GET() {
  try {
    const data = await getApplication()
    if (!data) return NextResponse.json({ error: "No application found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
