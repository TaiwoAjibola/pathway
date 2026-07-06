import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIds } from "@/lib/data"
import type { Prisma } from "@prisma/client"

const TASKS = [
  // Stage 1 — Planning
  { stageCode: "planning", title: "Decide immigration pathway (Express Entry - French Category)", priority: "CRITICAL", owner: "both" },
  { stageCode: "planning", title: "Confirm Principal Applicant", priority: "CRITICAL", owner: "both" },
  { stageCode: "planning", title: "Add Spouse as dependent", priority: "HIGH", owner: "both" },
  { stageCode: "planning", title: "Add Child as dependent", priority: "HIGH", owner: "both" },
  { stageCode: "planning", title: "Build immigration timeline", priority: "HIGH", owner: "both" },
  { stageCode: "planning", title: "Set target application date", priority: "HIGH", owner: "both" },
  { stageCode: "planning", title: "Create journey workspace", priority: "MEDIUM", owner: "both" },
  // Stage 2 — Eligibility
  { stageCode: "eligibility", title: "Calculate initial CRS score", priority: "HIGH", owner: "both" },
  { stageCode: "eligibility", title: "Calculate target CRS score for French draws", priority: "HIGH", owner: "both" },
  { stageCode: "eligibility", title: "Check FSW 67-point eligibility", priority: "CRITICAL", owner: "both" },
  // Stage 3 — Identity Documents (Wife)
  { stageCode: "documents", title: "[Wife] Obtain or renew passport", priority: "CRITICAL", owner: "spouse" },
  { stageCode: "documents", title: "[Wife] Obtain birth certificate", priority: "HIGH", owner: "spouse" },
  { stageCode: "documents", title: "[Wife] Obtain national ID (optional)", priority: "MEDIUM", owner: "spouse" },
  { stageCode: "documents", title: "[Wife] Take digital passport photograph", priority: "HIGH", owner: "spouse" },
  // Stage 3 — Identity Documents (You)
  { stageCode: "documents", title: "[You] Obtain or renew passport", priority: "CRITICAL", owner: "me" },
  { stageCode: "documents", title: "[You] Obtain birth certificate", priority: "HIGH", owner: "me" },
  { stageCode: "documents", title: "[You] Obtain national ID", priority: "MEDIUM", owner: "me" },
  { stageCode: "documents", title: "[You] Take digital passport photograph", priority: "HIGH", owner: "me" },
  // Stage 3 — Identity Documents (Child)
  { stageCode: "documents", title: "[Child] Obtain passport", priority: "HIGH", owner: "both", dependsOn: "child" },
  { stageCode: "documents", title: "[Child] Obtain birth certificate", priority: "HIGH", owner: "both" },
  { stageCode: "documents", title: "[Child] Take passport photograph", priority: "MEDIUM", owner: "both" },
  // Stage 4 — Education (Wife)
  { stageCode: "credential-assessment", title: "[Wife] Obtain bachelor's degree certificate", priority: "HIGH", owner: "spouse" },
  { stageCode: "credential-assessment", title: "[Wife] Request official transcripts from university", priority: "HIGH", owner: "spouse" },
  { stageCode: "credential-assessment", title: "[Wife] Create WES account for ECA", priority: "HIGH", owner: "spouse" },
  { stageCode: "credential-assessment", title: "[Wife] Submit documents to WES for ECA", priority: "HIGH", owner: "spouse" },
  { stageCode: "credential-assessment", title: "[Wife] Receive ECA report from WES", priority: "HIGH", owner: "spouse" },
  // Stage 4 — Education (You)
  { stageCode: "credential-assessment", title: "[You] Obtain bachelor's degree certificate", priority: "HIGH", owner: "me" },
  { stageCode: "credential-assessment", title: "[You] Request official transcripts", priority: "HIGH", owner: "me" },
  { stageCode: "credential-assessment", title: "[You] Reactivate existing WES account", priority: "HIGH", owner: "me" },
  { stageCode: "credential-assessment", title: "[You] Convert WES to immigration ECA if needed", priority: "HIGH", owner: "me" },
  { stageCode: "credential-assessment", title: "[You] Upload missing documents to WES", priority: "MEDIUM", owner: "me" },
  { stageCode: "credential-assessment", title: "[You] Receive ECA report", priority: "HIGH", owner: "me" },
  // Stage 5 — Language Tests (Wife — French)
  { stageCode: "language-tests", title: "[Wife] Choose TEF or TCF Canada", priority: "HIGH", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Register for French language test", priority: "HIGH", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Pay French test fees", priority: "HIGH", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Study plan — French listening practice", priority: "HIGH", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Study plan — French reading practice", priority: "HIGH", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Study plan — French writing practice", priority: "HIGH", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Study plan — French speaking practice", priority: "HIGH", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Take French mock exams", priority: "MEDIUM", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Take French test (TEF/TCF)", priority: "CRITICAL", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Receive French test results", priority: "HIGH", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Upload French test results", priority: "HIGH", owner: "spouse" },
  // Stage 5 — Language Tests (Wife — English IELTS)
  { stageCode: "language-tests", title: "[Wife] Register for IELTS General", priority: "MEDIUM", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Pay IELTS fees", priority: "MEDIUM", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Practice IELTS materials", priority: "MEDIUM", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Take IELTS mock tests", priority: "MEDIUM", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Write IELTS General exam", priority: "MEDIUM", owner: "spouse" },
  { stageCode: "language-tests", title: "[Wife] Upload IELTS results", priority: "MEDIUM", owner: "spouse" },
  // Stage 5 — Language Tests (You — English IELTS)
  { stageCode: "language-tests", title: "[You] Register for IELTS General", priority: "HIGH", owner: "me" },
  { stageCode: "language-tests", title: "[You] Pay IELTS fees", priority: "HIGH", owner: "me" },
  { stageCode: "language-tests", title: "[You] Prepare — IELTS study plan", priority: "HIGH", owner: "me" },
  { stageCode: "language-tests", title: "[You] Take IELTS mock tests", priority: "MEDIUM", owner: "me" },
  { stageCode: "language-tests", title: "[You] Write IELTS General exam", priority: "CRITICAL", owner: "me" },
  { stageCode: "language-tests", title: "[You] Receive IELTS results", priority: "HIGH", owner: "me" },
  { stageCode: "language-tests", title: "[You] Upload IELTS results", priority: "HIGH", owner: "me" },
  // Stage 6 — Employment (Wife)
  { stageCode: "employment", title: "[Wife] Request employment reference letter (current employer)", priority: "HIGH", owner: "spouse" },
  { stageCode: "employment", title: "[Wife] Request employment reference letters (previous employers)", priority: "HIGH", owner: "spouse" },
  { stageCode: "employment", title: "[Wife] Collect offer letters for each employer", priority: "MEDIUM", owner: "spouse" },
  { stageCode: "employment", title: "[Wife] Collect promotion letters if applicable", priority: "MEDIUM", owner: "spouse" },
  { stageCode: "employment", title: "[Wife] Collect payslips for last 3+ months", priority: "MEDIUM", owner: "spouse" },
  { stageCode: "employment", title: "[Wife] Collect tax documents (T4/NOA if available)", priority: "MEDIUM", owner: "spouse" },
  { stageCode: "employment", title: "[Wife] Prepare updated resume/CV", priority: "HIGH", owner: "spouse" },
  // Stage 6 — Employment (You)
  { stageCode: "employment", title: "[You] Request employment reference letter (current employer)", priority: "HIGH", owner: "me" },
  { stageCode: "employment", title: "[You] Request employment reference letters (previous employers)", priority: "HIGH", owner: "me" },
  { stageCode: "employment", title: "[You] Collect offer letters", priority: "MEDIUM", owner: "me" },
  { stageCode: "employment", title: "[You] Collect promotion letters", priority: "MEDIUM", owner: "me" },
  { stageCode: "employment", title: "[You] Collect payslips", priority: "MEDIUM", owner: "me" },
  { stageCode: "employment", title: "[You] Collect tax documents", priority: "MEDIUM", owner: "me" },
  { stageCode: "employment", title: "[You] Update resume/CV", priority: "HIGH", owner: "me" },
  // Stage 7 — Proof of Funds
  { stageCode: "proof-of-funds", title: "Determine required settlement funds amount", priority: "CRITICAL", owner: "both" },
  { stageCode: "proof-of-funds", title: "Create savings plan to reach required amount", priority: "HIGH", owner: "both" },
  { stageCode: "proof-of-funds", title: "Deposit and maintain required balance in account", priority: "CRITICAL", owner: "both" },
  { stageCode: "proof-of-funds", title: "Download 6 months of bank statements", priority: "HIGH", owner: "both" },
  { stageCode: "proof-of-funds", title: "Obtain official bank letter confirming funds", priority: "HIGH", owner: "both" },
  // Stage 8 — Civil Documents
  { stageCode: "documents", title: "Obtain marriage certificate", priority: "CRITICAL", owner: "both" },
  { stageCode: "documents", title: "Gather marriage photos (if required later)", priority: "LOW", owner: "both" },
  { stageCode: "documents", title: "[Child] Obtain birth certificate", priority: "HIGH", owner: "both", dependsOn: "child" },
  // Stage 9 — Express Entry Profile
  { stageCode: "ee-profile", title: "Create IRCC account", priority: "CRITICAL", owner: "both" },
  { stageCode: "ee-profile", title: "Create Express Entry profile", priority: "CRITICAL", owner: "both" },
  { stageCode: "ee-profile", title: "Add spouse to Express Entry profile", priority: "CRITICAL", owner: "both" },
  { stageCode: "ee-profile", title: "Add child as dependent on profile", priority: "HIGH", owner: "both" },
  { stageCode: "ee-profile", title: "Upload language test scores to profile", priority: "CRITICAL", owner: "both" },
  { stageCode: "ee-profile", title: "Upload ECA reports to profile", priority: "CRITICAL", owner: "both" },
  { stageCode: "ee-profile", title: "Input employment history into profile", priority: "HIGH", owner: "both" },
  { stageCode: "ee-profile", title: "Submit Express Entry profile and enter pool", priority: "CRITICAL", owner: "both" },
  // Stage 10 — Waiting for ITA
  { stageCode: "ita-prep", title: "Monitor CRS draw scores regularly", priority: "HIGH", owner: "both" },
  { stageCode: "ita-prep", title: "Monitor French-language category draws", priority: "HIGH", owner: "both" },
  { stageCode: "ita-prep", title: "Update profile with new language scores if improved", priority: "MEDIUM", owner: "both" },
  { stageCode: "ita-prep", title: "Update profile with new work experience", priority: "MEDIUM", owner: "both" },
  { stageCode: "ita-prep", title: "Update profile with new education if applicable", priority: "MEDIUM", owner: "both" },
  // Stage 11 — ITA Received
  { stageCode: "ita-prep", title: "Accept Invitation to Apply (ITA)", priority: "CRITICAL", owner: "both" },
  { stageCode: "ita-prep", title: "Generate PR application checklist from IRCC", priority: "CRITICAL", owner: "both" },
  { stageCode: "ita-prep", title: "Begin preparing PR application documents", priority: "CRITICAL", owner: "both" },
  // Stage 12 — Medical Exam
  { stageCode: "medical", title: "[You] Find panel physician and schedule medical exam", priority: "HIGH", owner: "me" },
  { stageCode: "medical", title: "[You] Complete immigration medical exam", priority: "HIGH", owner: "me" },
  { stageCode: "medical", title: "[Spouse] Find panel physician and schedule medical", priority: "HIGH", owner: "spouse" },
  { stageCode: "medical", title: "[Spouse] Complete immigration medical exam", priority: "HIGH", owner: "spouse" },
  { stageCode: "medical", title: "[Child] Schedule medical exam with panel physician", priority: "HIGH", owner: "both" },
  { stageCode: "medical", title: "[Child] Complete immigration medical exam", priority: "HIGH", owner: "both" },
  // Stage 12 — Police Certificates
  { stageCode: "police-certificates", title: "[You] Apply for police certificate (country of residence)", priority: "CRITICAL", owner: "me" },
  { stageCode: "police-certificates", title: "[You] Apply for police certificate (home country)", priority: "CRITICAL", owner: "me" },
  { stageCode: "police-certificates", title: "[Spouse] Apply for police certificate (country of residence)", priority: "CRITICAL", owner: "spouse" },
  { stageCode: "police-certificates", title: "[Spouse] Apply for police certificate (home country)", priority: "CRITICAL", owner: "spouse" },
  // Stage 13 — Final PR Submission
  { stageCode: "final-pr", title: "Upload all required documents to IRCC portal", priority: "CRITICAL", owner: "both" },
  { stageCode: "final-pr", title: "Review entire PR application for accuracy", priority: "CRITICAL", owner: "both" },
  { stageCode: "final-pr", title: "Pay PR application fees (processing + RPRF)", priority: "CRITICAL", owner: "both" },
  { stageCode: "final-pr", title: "Submit complete PR application (e-APR)", priority: "CRITICAL", owner: "both" },
  { stageCode: "final-pr", title: "Receive Acknowledgment of Receipt (AOR)", priority: "HIGH", owner: "both" },
  // Stage 14 — Background Processing
  { stageCode: "approval", title: "Complete biometrics appointment", priority: "HIGH", owner: "both" },
  { stageCode: "approval", title: "Track medical exam status (passed)", priority: "MEDIUM", owner: "both" },
  { stageCode: "approval", title: "Track background check status", priority: "MEDIUM", owner: "both" },
  { stageCode: "approval", title: "Track eligibility review status", priority: "MEDIUM", owner: "both" },
  { stageCode: "approval", title: "Respond to any additional document requests", priority: "CRITICAL", owner: "both" },
  { stageCode: "approval", title: "Wait for final decision on application", priority: "HIGH", owner: "both" },
  // Stage 15 — COPR
  { stageCode: "approval", title: "Receive Confirmation of Permanent Residence (COPR)", priority: "CRITICAL", owner: "both" },
  { stageCode: "approval", title: "Receive Passport Request (if applicable)", priority: "CRITICAL", owner: "both" },
  { stageCode: "approval", title: "Submit passports for visa issuance", priority: "CRITICAL", owner: "both" },
  { stageCode: "approval", title: "Receive passports with visa / COPR", priority: "CRITICAL", owner: "both" },
  // Stage 16 — Landing
  { stageCode: "landing", title: "Book flights to Canada", priority: "HIGH", owner: "both" },
  { stageCode: "landing", title: "Arrange temporary accommodation", priority: "HIGH", owner: "both" },
  { stageCode: "landing", title: "Purchase travel/medical insurance", priority: "HIGH", owner: "both" },
  { stageCode: "landing", title: "Prepare arrival checklist (documents, funds)", priority: "HIGH", owner: "both" },
  { stageCode: "landing", title: "Apply for SIN (Social Insurance Number)", priority: "HIGH", owner: "both" },
  { stageCode: "landing", title: "Open bank account in Canada", priority: "HIGH", owner: "both" },
  { stageCode: "landing", title: "Apply for provincial health card", priority: "HIGH", owner: "both" },
  { stageCode: "landing", title: "Get Canadian phone number", priority: "MEDIUM", owner: "both" },
  { stageCode: "landing", title: "Begin job search in Canada", priority: "HIGH", owner: "both" },
]

export async function POST() {
  try {
    const { appId } = await getIds()

    const existing = await prisma.taskInstance.count({ where: { applicationId: appId } })
    if (existing > 0) {
      return NextResponse.json({ error: `Already have ${existing} tasks. Delete them first if you want to reload.` }, { status: 400 })
    }

    const stageMap = new Map<string, string>()
    const stages = await prisma.applicationStage.findMany({
      where: { applicationId: appId },
      include: { stage: true },
    })
    for (const s of stages) {
      stageMap.set(s.stage.code, s.stage.id)
    }

    let created = 0
    for (const t of TASKS) {
      const stageId = stageMap.get(t.stageCode)
      if (!stageId) continue

      const metadata: Record<string, unknown> = {}
      if (t.dependsOn) metadata.dependsOn = t.dependsOn

      await prisma.taskInstance.create({
        data: {
          applicationId: appId,
          stageId,
          templateId: "template",
          title: t.title,
          priority: t.priority as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
          status: "NOT_STARTED",
          estimatedTimeMinutes: 30,
          metadata: metadata as Prisma.InputJsonValue,
        },
      })
      created++
    }

    return NextResponse.json({ created, total: TASKS.length })
  } catch (error) {
    console.error("API POST error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const { appId } = await getIds()
    const result = await prisma.taskInstance.deleteMany({
      where: { applicationId: appId, templateId: "template" },
    })
    return NextResponse.json({ deleted: result.count })
  } catch (error) {
    console.error("API DELETE error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
