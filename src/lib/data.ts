import { prisma } from "./prisma"

async function resolveIds() {
  const [user, app, applicant] = await Promise.all([
    prisma.user.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.application.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.applicant.findFirst({ orderBy: { createdAt: "asc" } }),
  ])
  return {
    userId: user?.id ?? "",
    appId: app?.id ?? "",
    applicantId: applicant?.id ?? "",
  }
}

export async function getIds() {
  return resolveIds()
}

export async function getApplication() {
  const { appId } = await resolveIds()
  if (!appId) return null
  return prisma.application.findUnique({
    where: { id: appId },
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
  const { applicantId } = await resolveIds()
  if (!applicantId) return null
  return prisma.applicant.findUnique({
    where: { id: applicantId },
    include: {
      educationEntries: true,
      employmentEntries: true,
      languageTests: true,
      documents: true,
    },
  })
}

export async function getLanguageTests() {
  const { applicantId } = await resolveIds()
  if (!applicantId) return []
  return prisma.languageTest.findMany({
    where: { applicantId },
    orderBy: { createdAt: "desc" },
  })
}

export async function getDocuments() {
  const { applicantId } = await resolveIds()
  if (!applicantId) return []
  return prisma.document.findMany({
    where: { applicantId },
    orderBy: { createdAt: "desc" },
  })
}

export async function getTasks() {
  const { appId } = await resolveIds()
  if (!appId) return []
  return prisma.taskInstance.findMany({
    where: { applicationId: appId },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  })
}

export async function getUser() {
  const { userId } = await resolveIds()
  if (!userId) return null
  return prisma.user.findUnique({
    where: { id: userId },
  })
}
