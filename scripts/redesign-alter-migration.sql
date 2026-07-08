-- Redesign Migration: Stage-centric roadmap + task groups + simplified LanguageTest

BEGIN;

-- 1. Drop CRSSnapshot table (removed from schema)
DROP TABLE IF EXISTS "CRSSnapshot" CASCADE;

-- 2. Remove CRS columns from Application
ALTER TABLE "Application" DROP COLUMN IF EXISTS "crsScore", DROP COLUMN IF EXISTS "targetCrsScore";

-- 3. Add timeline fields to ApplicationStage
ALTER TABLE "ApplicationStage" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE "ApplicationStage" ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);
ALTER TABLE "ApplicationStage" ADD COLUMN IF NOT EXISTS "duration" INTEGER;
ALTER TABLE "ApplicationStage" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- 4. Create TaskGroup table
CREATE TABLE IF NOT EXISTS "TaskGroup" (
    "id" TEXT NOT NULL,
    "applicationStageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TaskGroup_pkey" PRIMARY KEY ("id")
);

-- 5. TaskGroup foreign key
ALTER TABLE "TaskGroup" ADD CONSTRAINT IF NOT EXISTS "TaskGroup_applicationStageId_fkey"
    FOREIGN KEY ("applicationStageId") REFERENCES "ApplicationStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. Add new fields to TaskInstance
ALTER TABLE "TaskInstance" ADD COLUMN IF NOT EXISTS "plannedDate" TIMESTAMP(3);
ALTER TABLE "TaskInstance" ADD COLUMN IF NOT EXISTS "plannedTime" TEXT;
ALTER TABLE "TaskInstance" ADD COLUMN IF NOT EXISTS "deadline" TIMESTAMP(3);
ALTER TABLE "TaskInstance" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TaskInstance" ADD COLUMN IF NOT EXISTS "groupId" TEXT;

-- 7. TaskInstance -> TaskGroup foreign key
ALTER TABLE "TaskInstance" ADD CONSTRAINT IF NOT EXISTS "TaskInstance_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "TaskGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 8. Update LanguageTest: add new columns
ALTER TABLE "LanguageTest" ADD COLUMN IF NOT EXISTS "testCenter" TEXT;
ALTER TABLE "LanguageTest" ADD COLUMN IF NOT EXISTS "resultDate" TIMESTAMP(3);
ALTER TABLE "LanguageTest" ADD COLUMN IF NOT EXISTS "expiryDate" TIMESTAMP(3);
ALTER TABLE "LanguageTest" ADD COLUMN IF NOT EXISTS "trfNumber" TEXT;
ALTER TABLE "LanguageTest" ADD COLUMN IF NOT EXISTS "testReportUrl" TEXT;
ALTER TABLE "LanguageTest" ADD COLUMN IF NOT EXISTS "bookingReference" TEXT;
ALTER TABLE "LanguageTest" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- 9. Drop old LanguageTest columns (not in new schema)
ALTER TABLE "LanguageTest" DROP COLUMN IF EXISTS "bookingStatus" CASCADE;
ALTER TABLE "LanguageTest" DROP COLUMN IF EXISTS "clbListening" CASCADE;
ALTER TABLE "LanguageTest" DROP COLUMN IF EXISTS "clbReading" CASCADE;
ALTER TABLE "LanguageTest" DROP COLUMN IF EXISTS "clbWriting" CASCADE;
ALTER TABLE "LanguageTest" DROP COLUMN IF EXISTS "clbSpeaking" CASCADE;
ALTER TABLE "LanguageTest" DROP COLUMN IF EXISTS "nclcLevel" CASCADE;
ALTER TABLE "LanguageTest" DROP COLUMN IF EXISTS "studyStreak" CASCADE;
ALTER TABLE "LanguageTest" DROP COLUMN IF EXISTS "lastStudyDate" CASCADE;

COMMIT;
