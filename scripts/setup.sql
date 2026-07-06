-- =============================================================
-- PATHWAY — One-click database setup
-- Run this ONCE in Supabase SQL Editor
-- =============================================================
-- Sign in at /login with:
--   Email:    admin@pathway.app
--   Password: admin123
-- =============================================================

-- 1. Create user
INSERT INTO "User" (id, email, name, "hashedPassword", "createdAt", "updatedAt")
SELECT 'cm00000000000000000000001', 'admin@pathway.app', 'Admin User',
       '$2b$12$PGNLED2/NFP6yj1nJ8yY5uebGKnS/A0NnlONLazxDGleNZNICLwDK',
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'admin@pathway.app');

-- 2. Create Pathway
INSERT INTO "Pathway" (id, code, name, description, country, "visaCategory", version, active, config, "createdAt", "updatedAt")
SELECT 'cm00000000000000000000002', 'express-entry-fsw', 'Canada PR — Express Entry (FSW)',
       'Federal Skilled Worker program for Canada Permanent Residence',
       'Canada', 'Permanent Residence', '1.0.0', true,
       '{"eligibilityType":"fsw_67_points","minimumPoints":67,"drawCutoffs":[473,471,475,472,470]}',
       NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Pathway" WHERE code = 'express-entry-fsw');

-- 3. Create Stages
INSERT INTO "Stage" (id, "pathwayId", code, name, description, "order", "autoUnlock", "estimatedDurationDays", "createdAt", "updatedAt")
SELECT * FROM (VALUES
  ('s-planning', 'cm00000000000000000000002', 'planning', 'Planning', 'Assess your pathway and set goals', 1, true, 3, NOW(), NOW()),
  ('s-eligibility', 'cm00000000000000000000002', 'eligibility', 'Eligibility', 'Check FSW 67 points and CRS', 2, true, 7, NOW(), NOW()),
  ('s-documents', 'cm00000000000000000000002', 'documents', 'Document Gathering', 'Collect all required documents', 3, true, 14, NOW(), NOW()),
  ('s-credential', 'cm00000000000000000000002', 'credential-assessment', 'Credential Assessment', 'Get ECA from designated org', 4, false, 60, NOW(), NOW()),
  ('s-language', 'cm00000000000000000000002', 'language-tests', 'Language Tests', 'Take IELTS/CELPIP/TEF', 5, true, 45, NOW(), NOW()),
  ('s-employment', 'cm00000000000000000000002', 'employment', 'Employment Verification', 'Collect reference letters', 6, true, 30, NOW(), NOW()),
  ('s-pof', 'cm00000000000000000000002', 'proof-of-funds', 'Proof of Funds', 'Show settlement funds', 7, true, 14, NOW(), NOW()),
  ('s-ee-profile', 'cm00000000000000000000002', 'ee-profile', 'Express Entry Profile', 'Create and submit EE profile', 8, false, 3, NOW(), NOW()),
  ('s-ita', 'cm00000000000000000000002', 'ita-prep', 'ITA Preparation', 'Prepare documents for ITA', 9, false, 30, NOW(), NOW()),
  ('s-medical', 'cm00000000000000000000002', 'medical', 'Medical Exam', 'Complete immigration medical', 10, true, 30, NOW(), NOW()),
  ('s-police', 'cm00000000000000000000002', 'police-certificates', 'Police Certificates', 'Obtain PCC from all countries', 11, false, 60, NOW(), NOW()),
  ('s-final-pr', 'cm00000000000000000000002', 'final-pr', 'Final PR Application', 'Submit e-APR', 12, false, 14, NOW(), NOW()),
  ('s-approval', 'cm00000000000000000000002', 'approval', 'Approval & COPR', 'Wait for PPR and COPR', 13, false, 180, NOW(), NOW()),
  ('s-landing', 'cm00000000000000000000002', 'landing', 'Landing in Canada', 'Prepare for landing', 14, false, 90, NOW(), NOW())
) AS v(id, "pathwayId", code, name, description, "order", "autoUnlock", "estimatedDurationDays", "createdAt", "updatedAt")
WHERE NOT EXISTS (SELECT 1 FROM "Stage" WHERE code = v.code);

-- 4. Create Application
INSERT INTO "Application" (id, "userId", "pathwayId", label, status, "currentStageId", "crsScore", "targetCrsScore", "healthScore", "readinessScore", "createdAt", "updatedAt")
SELECT 'a000000000000000000001', 'cm00000000000000000000001', 'cm00000000000000000000002',
       'Canada PR — Express Entry', 'IN_PROGRESS', 's-credential', 456, 470, 84, 68, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Application" WHERE id = 'a000000000000000000001');

-- 5. Create Primary Applicant
INSERT INTO "Applicant" (id, "applicationId", type, "isDependent", "firstName", "lastName", "dateOfBirth", nationality, "countryOfResidence", "maritalStatus", "medicalStatus", "createdAt", "updatedAt")
SELECT 'ap00000000000000000001', 'a000000000000000000001', 'PRIMARY', false,
       'John', 'Doe', '1997-01-15', 'Nigeria', 'Nigeria', 'MARRIED', 'NOT_STARTED', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Applicant" WHERE id = 'ap00000000000000000001');

-- 6. Create ApplicationStage records
INSERT INTO "ApplicationStage" (id, "applicationId", "stageId", status, progress, "createdAt", "updatedAt")
SELECT * FROM (VALUES
  ('as-planning', 'a000000000000000000001', 's-planning', 'COMPLETED', 100, NOW(), NOW()),
  ('as-elig', 'a000000000000000000001', 's-eligibility', 'COMPLETED', 100, NOW(), NOW()),
  ('as-docs', 'a000000000000000000001', 's-documents', 'COMPLETED', 100, NOW(), NOW()),
  ('as-cred', 'a000000000000000000001', 's-credential', 'IN_PROGRESS', 40, NOW(), NOW()),
  ('as-lang', 'a000000000000000000001', 's-language', 'IN_PROGRESS', 25, NOW(), NOW()),
  ('as-emp', 'a000000000000000000001', 's-employment', 'UNLOCKED', 10, NOW(), NOW()),
  ('as-pof', 'a000000000000000000001', 's-proof-of-funds', 'UNLOCKED', 0, NOW(), NOW()),
  ('as-ee', 'a000000000000000000001', 's-ee-profile', 'LOCKED', 0, NOW(), NOW()),
  ('as-ita', 'a000000000000000000001', 's-ita-prep', 'LOCKED', 0, NOW(), NOW()),
  ('as-med', 'a000000000000000000001', 's-medical', 'LOCKED', 0, NOW(), NOW()),
  ('as-police', 'a000000000000000000001', 's-police-certificates', 'LOCKED', 0, NOW(), NOW()),
  ('as-final', 'a000000000000000000001', 's-final-pr', 'LOCKED', 0, NOW(), NOW()),
  ('as-approval', 'a000000000000000000001', 's-approval', 'LOCKED', 0, NOW(), NOW()),
  ('as-landing', 'a000000000000000000001', 's-landing', 'LOCKED', 0, NOW(), NOW())
) AS v(id, "applicationId", "stageId", status, progress, "createdAt", "updatedAt")
WHERE NOT EXISTS (SELECT 1 FROM "ApplicationStage" WHERE id = v.id);
