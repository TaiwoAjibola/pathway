import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"

export async function GET() {
  const { applicantId } = getIds()
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
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { applicantId } = getIds()
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
}
