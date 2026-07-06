import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12)

  const user = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      email: "john@example.com",
      name: "John Doe",
      hashedPassword,
    },
  })

  const pathway = await prisma.pathway.upsert({
    where: { code: "express-entry-fsw" },
    update: {},
    create: {
      code: "express-entry-fsw",
      name: "Canada PR — Express Entry (FSW)",
      country: "Canada",
      visaCategory: "Permanent Residence",
      version: "1.0.0",
      active: true,
      config: {
        eligibilityType: "fsw_67_points",
        minimumPoints: 67,
        drawCutoffs: [473, 471, 475, 472, 470],
      },
    },
  })

  const stageData = [
    { code: "planning", name: "Planning", order: 1, autoUnlock: true, estimatedDurationDays: 3 },
    { code: "eligibility", name: "Eligibility", order: 2, autoUnlock: true, estimatedDurationDays: 7 },
    { code: "documents", name: "Document Gathering", order: 3, autoUnlock: true, estimatedDurationDays: 14 },
    { code: "credential-assessment", name: "Credential Assessment", order: 4, autoUnlock: false, estimatedDurationDays: 60 },
    { code: "language-tests", name: "Language Tests", order: 5, autoUnlock: true, estimatedDurationDays: 45 },
    { code: "employment", name: "Employment Verification", order: 6, autoUnlock: true, estimatedDurationDays: 30 },
    { code: "proof-of-funds", name: "Proof of Funds", order: 7, autoUnlock: true, estimatedDurationDays: 14 },
    { code: "ee-profile", name: "Express Entry Profile", order: 8, autoUnlock: false, estimatedDurationDays: 3 },
    { code: "ita-prep", name: "ITA Preparation", order: 9, autoUnlock: false, estimatedDurationDays: 30 },
    { code: "medical", name: "Medical Exam", order: 10, autoUnlock: true, estimatedDurationDays: 30 },
    { code: "police-certificates", name: "Police Certificates", order: 11, autoUnlock: false, estimatedDurationDays: 60 },
    { code: "final-pr", name: "Final PR Application", order: 12, autoUnlock: false, estimatedDurationDays: 14 },
    { code: "approval", name: "Approval & COPR", order: 13, autoUnlock: false, estimatedDurationDays: 180 },
    { code: "landing", name: "Landing in Canada", order: 14, autoUnlock: false, estimatedDurationDays: 90 },
  ]

  for (const stage of stageData) {
    await prisma.stage.upsert({
      where: { pathwayId_code: { pathwayId: pathway.id, code: stage.code } },
      update: {},
      create: { ...stage, pathwayId: pathway.id },
    })
  }

  console.log("Seed completed successfully")
  console.log(`User: john@example.com / password123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
