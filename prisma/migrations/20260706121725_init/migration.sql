-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MODERATE', 'HARD', 'COMPLEX');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'WAITING', 'BLOCKED', 'COMPLETED', 'EXPIRED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PLANNING', 'ELIGIBILITY', 'DOCUMENTS', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'LANDED');

-- CreateEnum
CREATE TYPE "ApplicantType" AS ENUM ('PRIMARY', 'SPOUSE', 'CHILD');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'COMMON_LAW', 'DIVORCED', 'WIDOWED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('LOCKED', 'UNLOCKED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('NOT_UPLOADED', 'UPLOADED', 'REVIEWING', 'APPROVED', 'REJECTED', 'EXPIRING_SOON', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_UPDATE');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('IELTS_GENERAL', 'CELPIP', 'TEF', 'TCF');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('NOT_BOOKED', 'BOOKED', 'RESCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('PENDING', 'RECEIVED', 'VALIDATED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PreparationStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'READY', 'TAKEN');

-- CreateEnum
CREATE TYPE "MedicalStatus" AS ENUM ('NOT_STARTED', 'SCHEDULED', 'COMPLETED', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('HIGH_SCHOOL', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TASK_DUE', 'TASK_OVERDUE', 'TASK_UNLOCKED', 'DOCUMENT_EXPIRING', 'DOCUMENT_EXPIRED', 'DRAW_ALERT', 'ITA_RECEIVED', 'MILESTONE', 'STAGNATION', 'POLICY_CHANGE', 'AI_RECOMMENDATION', 'APPOINTMENT_REMINDER');

-- CreateEnum
CREATE TYPE "NotificationUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "hashedPassword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Pathway" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "country" TEXT NOT NULL,
    "visaCategory" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pathway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "pathwayId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "autoUnlock" BOOLEAN NOT NULL DEFAULT false,
    "estimatedDurationDays" INTEGER,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTemplate" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reason" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MODERATE',
    "estimatedTimeMinutes" INTEGER NOT NULL DEFAULT 30,
    "autoUnlock" BOOLEAN NOT NULL DEFAULT true,
    "autoComplete" BOOLEAN NOT NULL DEFAULT false,
    "completionCriteria" JSONB,
    "helpfulResources" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "dependsOnId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pathwayId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PLANNING',
    "currentStageId" TEXT,
    "crsScore" INTEGER NOT NULL DEFAULT 0,
    "targetCrsScore" INTEGER NOT NULL DEFAULT 500,
    "healthScore" INTEGER NOT NULL DEFAULT 100,
    "readinessScore" INTEGER NOT NULL DEFAULT 0,
    "estimatedCompletionDate" TIMESTAMP(3),
    "daysRemaining" INTEGER NOT NULL DEFAULT 0,
    "journeyVelocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "ApplicantType" NOT NULL DEFAULT 'PRIMARY',
    "isDependent" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "countryOfResidence" TEXT,
    "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'SINGLE',
    "email" TEXT,
    "phone" TEXT,
    "metadata" JSONB,
    "medicalStatus" "MedicalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationStage" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "status" "StageStatus" NOT NULL DEFAULT 'LOCKED',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskInstance" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "applicantId" TEXT,
    "templateId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reason" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MODERATE',
    "estimatedTimeMinutes" INTEGER NOT NULL DEFAULT 30,
    "dueDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "notes" TEXT,
    "evidence" JSONB,
    "helpfulResources" JSONB,
    "aiGuidance" TEXT,
    "aiRisks" JSONB,
    "aiRecommendations" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "templateId" TEXT,
    "taskId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "purpose" TEXT,
    "issuingAuthority" TEXT,
    "expirationRules" JSONB,
    "status" "DocumentStatus" NOT NULL DEFAULT 'NOT_UPLOADED',
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "aiReviewNotes" TEXT,
    "reviewerNotes" TEXT,
    "expiryDate" TIMESTAMP(3),
    "expiryReminderSent" BOOLEAN NOT NULL DEFAULT false,
    "commonMistakes" JSONB,
    "tips" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "ocrText" TEXT,
    "aiValidation" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "pathwayId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "purpose" TEXT,
    "issuingAuthority" TEXT,
    "whenNeeded" TEXT,
    "expirationRules" JSONB,
    "acceptedFormats" JSONB,
    "maxSizeMB" INTEGER NOT NULL DEFAULT 10,
    "colorRequirement" TEXT NOT NULL DEFAULT 'EITHER',
    "notarizationRequired" BOOLEAN NOT NULL DEFAULT false,
    "translationRequired" BOOLEAN NOT NULL DEFAULT false,
    "sampleUrl" TEXT,
    "commonMistakes" JSONB,
    "tips" JSONB,
    "validationRules" JSONB,
    "aiValidationPrompt" TEXT,
    "expiryReminderDays" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "level" "EducationLevel" NOT NULL,
    "field" TEXT,
    "institution" TEXT,
    "country" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "earnedDate" TIMESTAMP(3),
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employment" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "country" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "hoursPerWeek" INTEGER,
    "durationYears" DOUBLE PRECISION,
    "nocCode" TEXT,
    "isSkilled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageTest" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "testType" "TestType" NOT NULL,
    "language" TEXT NOT NULL,
    "bookingStatus" "BookingStatus" NOT NULL DEFAULT 'NOT_BOOKED',
    "testCenter" TEXT,
    "testDate" TIMESTAMP(3),
    "bookingReference" TEXT,
    "resultStatus" "ResultStatus" NOT NULL DEFAULT 'PENDING',
    "listeningScore" DOUBLE PRECISION,
    "readingScore" DOUBLE PRECISION,
    "writingScore" DOUBLE PRECISION,
    "speakingScore" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "clbListening" INTEGER,
    "clbReading" INTEGER,
    "clbWriting" INTEGER,
    "clbSpeaking" INTEGER,
    "nclcLevel" INTEGER,
    "testReportUrl" TEXT,
    "expiryDate" TIMESTAMP(3),
    "studyStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" TIMESTAMP(3),
    "preparationStatus" "PreparationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LanguageTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImmigrationRecord" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "visaType" TEXT,
    "entryDate" TIMESTAMP(3),
    "exitDate" TIMESTAMP(3),
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImmigrationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredentialAssessment" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "submittedDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "equivalency" TEXT,
    "reportUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CredentialAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliceCertificate" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "appliedDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoliceCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProofOfFunds" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "amount" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP(3),
    "documents" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProofOfFunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRSSnapshot" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "ageScore" INTEGER NOT NULL DEFAULT 0,
    "educationScore" INTEGER NOT NULL DEFAULT 0,
    "languageScore" INTEGER NOT NULL DEFAULT 0,
    "secondLanguageScore" INTEGER NOT NULL DEFAULT 0,
    "workExperienceScore" INTEGER NOT NULL DEFAULT 0,
    "skillsTransferScore" INTEGER NOT NULL DEFAULT 0,
    "additionalScore" INTEGER NOT NULL DEFAULT 0,
    "breakdown" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CRSSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "urgency" "NotificationUrgency" NOT NULL DEFAULT 'MEDIUM',
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Pathway_code_key" ON "Pathway"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_pathwayId_code_key" ON "Stage"("pathwayId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "TaskTemplate_stageId_code_key" ON "TaskTemplate"("stageId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDependency_taskId_dependsOnId_key" ON "TaskDependency"("taskId", "dependsOnId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationStage_applicationId_stageId_key" ON "ApplicationStage"("applicationId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplate_pathwayId_code_key" ON "DocumentTemplate"("pathwayId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ProofOfFunds_applicantId_key" ON "ProofOfFunds"("applicantId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_pathwayId_fkey" FOREIGN KEY ("pathwayId") REFERENCES "Pathway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTemplate" ADD CONSTRAINT "TaskTemplate_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "TaskTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_dependsOnId_fkey" FOREIGN KEY ("dependsOnId") REFERENCES "TaskTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_pathwayId_fkey" FOREIGN KEY ("pathwayId") REFERENCES "Pathway"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationStage" ADD CONSTRAINT "ApplicationStage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationStage" ADD CONSTRAINT "ApplicationStage_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskInstance" ADD CONSTRAINT "TaskInstance_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskInstance" ADD CONSTRAINT "TaskInstance_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskInstance" ADD CONSTRAINT "TaskInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TaskTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_pathwayId_fkey" FOREIGN KEY ("pathwayId") REFERENCES "Pathway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageTest" ADD CONSTRAINT "LanguageTest_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImmigrationRecord" ADD CONSTRAINT "ImmigrationRecord_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredentialAssessment" ADD CONSTRAINT "CredentialAssessment_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliceCertificate" ADD CONSTRAINT "PoliceCertificate_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofOfFunds" ADD CONSTRAINT "ProofOfFunds_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRSSnapshot" ADD CONSTRAINT "CRSSnapshot_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
