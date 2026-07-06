-- Clean up dummy seed data — keeps structure (user, application, pathway, stages)
-- Run this in Supabase SQL Editor

-- Remove all applicants (including John Doe)
DELETE FROM "Applicant";

-- Remove all task instances
DELETE FROM "TaskInstance";

-- Remove all CRS snapshots
DELETE FROM "CRSSnapshot";

-- Remove all documents, language tests, education, employment
DELETE FROM "Document";
DELETE FROM "LanguageTest";
DELETE FROM "Education";
DELETE FROM "Employment";

-- Reset all application stages to NOT_STARTED with 0 progress
UPDATE "ApplicationStage" SET status = 'LOCKED', progress = 0, "startedAt" = NULL, "completedAt" = NULL;

-- Unlock the first stage (planning) so the journey can begin
UPDATE "ApplicationStage" SET status = 'UNLOCKED', progress = 0
WHERE "stageId" = (SELECT id FROM "Stage" WHERE code = 'planning' LIMIT 1);

-- Reset application CRS and scores to zero
UPDATE "Application" SET "crsScore" = 0, "targetCrsScore" = 470, "healthScore" = 0, "readinessScore" = 0;

-- Verify cleanup
SELECT 'applicants' as tbl, count(*) FROM "Applicant"
UNION ALL SELECT 'tasks', count(*) FROM "TaskInstance"
UNION ALL SELECT 'documents', count(*) FROM "Document"
UNION ALL SELECT 'crs_snapshots', count(*) FROM "CRSSnapshot"
UNION ALL SELECT 'stages_locked', count(*) FROM "ApplicationStage" WHERE status = 'LOCKED'
UNION ALL SELECT 'stages_unlocked', count(*) FROM "ApplicationStage" WHERE status = 'UNLOCKED';
