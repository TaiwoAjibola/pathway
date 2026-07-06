import { prisma } from "./prisma"

const globalForIds = globalThis as unknown as { _ids: { userId: string; appId: string; applicantId: string } }

export async function getIds() {
  if (globalForIds._ids?.appId) return globalForIds._ids
  const [user, app, applicant] = await Promise.all([
    prisma.user.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.application.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.applicant.findFirst({ orderBy: { createdAt: "asc" } }),
  ])
  globalForIds._ids = {
    userId: user?.id ?? "",
    appId: app?.id ?? "",
    applicantId: applicant?.id ?? "",
  }
  return globalForIds._ids
}

export async function getApplication() {
  const { appId } = await getIds()
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
        include: {
          assignees: { include: { applicant: true } },
          documents: true,
        },
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
  const { applicantId } = await getIds()
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
  const { applicantId } = await getIds()
  if (!applicantId) return []
  return prisma.languageTest.findMany({
    where: { applicantId },
    orderBy: { createdAt: "desc" },
  })
}

export async function getDocuments() {
  const { applicantId } = await getIds()
  if (!applicantId) return []
  return prisma.document.findMany({
    where: { applicantId },
    include: { task: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getTasks() {
  const { appId } = await getIds()
  if (!appId) return []
  return prisma.taskInstance.findMany({
    where: { applicationId: appId },
    include: { assignees: { include: { applicant: true } } },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  })
}

export async function getUser() {
  const { userId } = await getIds()
  if (!userId) return null
  return prisma.user.findUnique({
    where: { id: userId },
  })
}
