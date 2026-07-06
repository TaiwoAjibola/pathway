import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  try {
    const { applicantId } = await getIds()
    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
      include: {
        educationEntries: true,
        employmentEntries: true,
        languageTests: true,
      },
    })
    if (!applicant) return NextResponse.json({ error: "Applicant not found" }, { status: 404 })
    return NextResponse.json(applicant)
  } catch (error) {
    console.error("API GET error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { applicantId } = await getIds()
    const applicant = await prisma.applicant.update({
      where: { id: applicantId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        nationality: body.nationality,
        countryOfResidence: body.countryOfResidence,
        maritalStatus: body.maritalStatus,
        email: body.email,
        phone: body.phone,
      },
    })
    return NextResponse.json(applicant)
  } catch (error) {
    console.error("API PATCH error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { appId } = await getIds()
    const body = await req.json()
    const applicant = await prisma.applicant.create({
      data: {
        applicationId: appId,
        type: body.type || "SPOUSE",
        isDependent: body.type === "CHILD",
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        nationality: body.nationality,
        countryOfResidence: body.countryOfResidence,
        maritalStatus: "MARRIED",
      },
    })
    return NextResponse.json(applicant, { status: 201 })
  } catch (error) {
    console.error("API POST error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
