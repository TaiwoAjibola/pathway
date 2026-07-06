import { prisma } from "./prisma"

const APP_ID = "a000000000000000000001"
const USER_ID = "u00000000000000000000001"
const APPLICANT_ID = "ap00000000000000000001"

export function getIds() {
  return { appId: APP_ID, userId: USER_ID, applicantId: APPLICANT_ID }
}

export async function getApplication() {
  return prisma.application.findUnique({
    where: { id: APP_ID },
    include: {
      pathway: true,
      applicants: true,
      stageProgress: {
        include: { stage: true },
        orderBy: { stage: { order: "asc" } },
      },
      taskInstances: {
        orderBy: { createdAt: "desc" },
      },
      crsSnapshots: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })
}

export async function getApplicant() {
  return prisma.applicant.findUnique({
    where: { id: APPLICANT_ID },
    include: {
      educationEntries: true,
      employmentEntries: true,
      languageTests: true,
      documents: true,
    },
  })
}

export async function getLanguageTests() {
  return prisma.languageTest.findMany({
    where: { applicantId: APPLICANT_ID },
    orderBy: { createdAt: "desc" },
  })
}

export async function getDocuments() {
  return prisma.document.findMany({
    where: { applicantId: APPLICANT_ID },
    orderBy: { createdAt: "desc" },
  })
}

export async function getTasks() {
  return prisma.taskInstance.findMany({
    where: { applicationId: APP_ID },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  })
}

export async function getUser() {
  return prisma.user.findUnique({
    where: { id: USER_ID },
  })
}
