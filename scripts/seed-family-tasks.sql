-- Seed family members and timeline tasks for the Canada PR journey

-- Get the application ID (should be the first/only one)
DO $$
DECLARE
  app_id TEXT := 'a000000000000000000001';
  user_id TEXT := 'u00000000000000000000001';
  primary_id TEXT;
  spouse_id TEXT;
  child_id TEXT;
  planning_stage_id TEXT;
  documents_stage_id TEXT;
  eligibility_stage_id TEXT;
  credential_stage_id TEXT;
  language_stage_id TEXT;
  employment_stage_id TEXT;
  funds_stage_id TEXT;
  ee_profile_stage_id TEXT;
  ita_prep_stage_id TEXT;
  medical_stage_id TEXT;
  police_stage_id TEXT;
  final_pr_stage_id TEXT;
  approval_stage_id TEXT;
  landing_stage_id TEXT;
BEGIN

-- Delete existing applicants (John Doe) and re-add
DELETE FROM "TaskAssignee";
DELETE FROM "TaskInstance";
DELETE FROM "Applicant";

-- Create family members
INSERT INTO "Applicant" (id, "applicationId", type, "isDependent", "firstName", "lastName", "maritalStatus", "createdAt", "updatedAt")
VALUES 
  ('ap-taiwo-oluwatoyin', app_id, 'PRIMARY', false, 'Taiwo', 'Oluwatoyin', 'MARRIED', NOW(), NOW()),
  ('ap-taiwo-ajibola', app_id, 'SPOUSE', false, 'Taiwo', 'Ajibola', 'MARRIED', NOW(), NOW()),
  ('ap-taiwo-ivana', app_id, 'CHILD', true, 'Taiwo', 'Ivana', 'MARRIED', NOW(), NOW());

primary_id := 'ap-taiwo-oluwatoyin';
spouse_id := 'ap-taiwo-ajibola';
child_id := 'ap-taiwo-ivana';

-- Get stage IDs
SELECT id INTO planning_stage_id FROM "Stage" WHERE code = 'planning';
SELECT id INTO documents_stage_id FROM "Stage" WHERE code = 'documents';
SELECT id INTO eligibility_stage_id FROM "Stage" WHERE code = 'eligibility';
SELECT id INTO credential_stage_id FROM "Stage" WHERE code = 'credential-assessment';
SELECT id INTO language_stage_id FROM "Stage" WHERE code = 'language-tests';
SELECT id INTO employment_stage_id FROM "Stage" WHERE code = 'employment';
SELECT id INTO funds_stage_id FROM "Stage" WHERE code = 'proof-of-funds';
SELECT id INTO ee_profile_stage_id FROM "Stage" WHERE code = 'ee-profile';
SELECT id INTO ita_prep_stage_id FROM "Stage" WHERE code = 'ita-prep';
SELECT id INTO medical_stage_id FROM "Stage" WHERE code = 'medical';
SELECT id INTO police_stage_id FROM "Stage" WHERE code = 'police-certificates';
SELECT id INTO final_pr_stage_id FROM "Stage" WHERE code = 'final-pr';
SELECT id INTO approval_stage_id FROM "Stage" WHERE code = 'approval';
SELECT id INTO landing_stage_id FROM "Stage" WHERE code = 'landing';

-- July Tasks: Document Gathering
INSERT INTO "TaskInstance" (id, "applicationId", "stageId", title, "taskType", category, priority, "dueDate", status, progress, "estimatedCost", currency, paid, notes, "createdAt", "updatedAt")
VALUES
  -- Passport Renewal tasks
  (gen_random_uuid()::TEXT, app_id, documents_stage_id, 'Renew passport - Taiwo Ajibola', 'DOCUMENT', 'Document', 'CRITICAL', '2026-07-31', 'IN_PROGRESS', 50, 25000, 'NGN', false, 'Current passport expires in 6 months', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, documents_stage_id, 'Renew passport - Taiwo Oluwatoyin', 'DOCUMENT', 'Document', 'CRITICAL', '2026-07-31', 'IN_PROGRESS', 50, 25000, 'NGN', false, 'Current passport expires in 8 months', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, documents_stage_id, 'Get passport - Taiwo Ivana', 'DOCUMENT', 'Document', 'CRITICAL', '2026-07-31', 'IN_PROGRESS', 30, 15000, 'NGN', false, 'First passport application', NOW(), NOW()),

  -- Birth Certificates
  (gen_random_uuid()::TEXT, app_id, documents_stage_id, 'Obtain birth certificate - Taiwo Ajibola', 'DOCUMENT', 'Document', 'HIGH', '2026-07-31', 'IN_PROGRESS', 20, 5000, 'NGN', false, 'Request from National Population Commission', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, documents_stage_id, 'Obtain birth certificate - Taiwo Oluwatoyin', 'DOCUMENT', 'Document', 'HIGH', '2026-07-31', 'IN_PROGRESS', 20, 5000, 'NGN', false, 'Request from National Population Commission', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, documents_stage_id, 'Obtain birth certificate - Taiwo Ivana', 'DOCUMENT', 'Document', 'HIGH', '2026-07-31', 'NOT_STARTED', 0, 5000, 'NGN', false, 'Birth already registered at hospital', NOW(), NOW()),

  -- Marriage Certificate
  (gen_random_uuid()::TEXT, app_id, documents_stage_id, 'Obtain marriage certificate', 'DOCUMENT', 'Document', 'CRITICAL', '2026-07-31', 'NOT_STARTED', 0, 10000, 'NGN', false, 'From marriage registry', NOW(), NOW()),

  -- Transcript Requests
  (gen_random_uuid()::TEXT, app_id, credential_stage_id, 'Request official transcripts - Taiwo Ajibola', 'DOCUMENT', 'Document', 'HIGH', '2026-07-31', 'NOT_STARTED', 0, 15000, 'NGN', false, 'Contact university registrar', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, credential_stage_id, 'Request official transcripts - Taiwo Oluwatoyin', 'DOCUMENT', 'Document', 'HIGH', '2026-07-31', 'NOT_STARTED', 0, 15000, 'NGN', false, 'Contact university registrar', NOW(), NOW()),

  -- WES
  (gen_random_uuid()::TEXT, app_id, credential_stage_id, 'Reactivate WES account - Taiwo Ajibola', 'CREDENTIAL_ASSESSMENT', 'Application', 'HIGH', '2026-07-31', 'NOT_STARTED', 0, 0, 'CAD', false, 'Already have existing WES account', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, credential_stage_id, 'Create WES account - Taiwo Oluwatoyin', 'CREDENTIAL_ASSESSMENT', 'Application', 'HIGH', '2026-07-31', 'NOT_STARTED', 0, 0, 'CAD', false, 'New WES application for spouse', NOW(), NOW()),

  -- French Study
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Begin French study - Taiwo Oluwatoyin', 'STUDY', 'Study', 'HIGH', '2026-07-31', 'NOT_STARTED', 0, 50000, 'NGN', false, 'Primary applicant needs French for category draw', NOW(), NOW()),

  -- IELTS Study
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Begin IELTS preparation - Taiwo Ajibola', 'STUDY', 'Study', 'HIGH', '2026-07-31', 'NOT_STARTED', 0, 30000, 'NGN', false, 'Start IELTS study materials', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Begin IELTS preparation - Taiwo Oluwatoyin', 'STUDY', 'Study', 'MEDIUM', '2026-08-15', 'NOT_STARTED', 0, 30000, 'NGN', false, 'Spouse needs IELTS for points', NOW(), NOW()),

  -- Employment Documents
  (gen_random_uuid()::TEXT, app_id, employment_stage_id, 'Collect employment reference letters - Taiwo Ajibola', 'DOCUMENT', 'Document', 'HIGH', '2026-07-31', 'NOT_STARTED', 0, 0, 'CAD', false, 'Request from current and past employers', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, employment_stage_id, 'Collect employment reference letters - Taiwo Oluwatoyin', 'DOCUMENT', 'Document', 'HIGH', '2026-07-31', 'NOT_STARTED', 0, 0, 'CAD', false, 'Request from current and past employers', NOW(), NOW()),

  -- Proof of Funds
  (gen_random_uuid()::TEXT, app_id, funds_stage_id, 'Create savings plan for settlement funds', 'PAYMENT', 'Finance', 'HIGH', '2026-07-31', 'NOT_STARTED', 0, 0, 'CAD', false, 'Family of 3: approximately $20,000 CAD required', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, funds_stage_id, 'Open joint savings account', 'PAYMENT', 'Finance', 'MEDIUM', '2026-08-15', 'NOT_STARTED', 0, 0, 'NGN', false, 'Joint account to build proof of funds', NOW(), NOW());

-- August Tasks
INSERT INTO "TaskInstance" (id, "applicationId", "stageId", title, "taskType", category, priority, "dueDate", status, progress, "estimatedCost", currency, paid, notes, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::TEXT, app_id, credential_stage_id, 'Receive official transcripts - Taiwo Ajibola', 'DOCUMENT', 'Document', 'HIGH', '2026-08-15', 'NOT_STARTED', 0, 0, 'CAD', false, 'Follow up with university', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, credential_stage_id, 'Receive official transcripts - Taiwo Oluwatoyin', 'DOCUMENT', 'Document', 'HIGH', '2026-08-15', 'NOT_STARTED', 0, 0, 'CAD', false, 'Follow up with university', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, credential_stage_id, 'Submit WES application - Taiwo Ajibola', 'CREDENTIAL_ASSESSMENT', 'Application', 'HIGH', '2026-08-15', 'NOT_STARTED', 0, 220, 'CAD', false, 'WES ECA application fee', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, credential_stage_id, 'Submit WES application - Taiwo Oluwatoyin', 'CREDENTIAL_ASSESSMENT', 'Application', 'HIGH', '2026-08-15', 'NOT_STARTED', 0, 220, 'CAD', false, 'WES ECA application fee', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Continue French classes - Taiwo Oluwatoyin', 'STUDY', 'Study', 'HIGH', '2026-08-31', 'NOT_STARTED', 0, 50000, 'NGN', false, 'Weekly French lessons', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Continue IELTS preparation - Taiwo Ajibola', 'STUDY', 'Study', 'HIGH', '2026-08-31', 'NOT_STARTED', 0, 0, 'CAD', false, 'Practice tests and materials', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Continue IELTS preparation - Taiwo Oluwatoyin', 'STUDY', 'Study', 'MEDIUM', '2026-08-31', 'NOT_STARTED', 0, 0, 'CAD', false, 'Practice tests', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Book TEF Canada exam - Taiwo Oluwatoyin', 'EXAM', 'Exam', 'CRITICAL', '2026-08-31', 'NOT_STARTED', 0, 400, 'CAD', false, 'Book for September date', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Book IELTS General exam - Taiwo Ajibola', 'EXAM', 'Exam', 'CRITICAL', '2026-08-31', 'NOT_STARTED', 0, 350, 'CAD', false, 'Book for September date', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Book IELTS General exam - Taiwo Oluwatoyin', 'EXAM', 'Exam', 'MEDIUM', '2026-08-31', 'NOT_STARTED', 0, 350, 'CAD', false, 'Book for September date', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, documents_stage_id, 'Collect remaining documents', 'DOCUMENT', 'Document', 'HIGH', '2026-08-31', 'NOT_STARTED', 0, 0, 'CAD', false, 'Any outstanding document requests', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, funds_stage_id, 'Build proof of funds - monthly savings', 'PAYMENT', 'Finance', 'HIGH', '2026-08-31', 'NOT_STARTED', 0, 500000, 'NGN', false, 'Monthly savings toward $20,000 CAD target', NOW(), NOW());

-- September Tasks
INSERT INTO "TaskInstance" (id, "applicationId", "stageId", title, "taskType", category, priority, "dueDate", status, progress, "estimatedCost", currency, paid, notes, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Write TEF Canada exam - Taiwo Oluwatoyin', 'EXAM', 'Exam', 'CRITICAL', '2026-09-15', 'NOT_STARTED', 0, 0, 'CAD', false, 'French proficiency exam for category draw', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Write IELTS General exam - Taiwo Ajibola', 'EXAM', 'Exam', 'CRITICAL', '2026-09-15', 'NOT_STARTED', 0, 0, 'CAD', false, 'English proficiency exam', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Write IELTS General exam - Taiwo Oluwatoyin', 'EXAM', 'Exam', 'MEDIUM', '2026-09-15', 'NOT_STARTED', 0, 0, 'CAD', false, 'English proficiency exam', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Receive TEF Canada results', 'EXAM', 'Exam', 'HIGH', '2026-09-30', 'NOT_STARTED', 0, 0, 'CAD', false, 'Results typically 2-3 weeks', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, language_stage_id, 'Receive IELTS results', 'EXAM', 'Exam', 'HIGH', '2026-09-30', 'NOT_STARTED', 0, 0, 'CAD', false, 'Results typically 13 days', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, credential_stage_id, 'Receive WES ECA evaluation - Taiwo Ajibola', 'CREDENTIAL_ASSESSMENT', 'Application', 'HIGH', '2026-09-30', 'NOT_STARTED', 0, 0, 'CAD', false, 'WES processing takes 4-6 weeks', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, credential_stage_id, 'Receive WES ECA evaluation - Taiwo Oluwatoyin', 'CREDENTIAL_ASSESSMENT', 'Application', 'HIGH', '2026-09-30', 'NOT_STARTED', 0, 0, 'CAD', false, 'WES processing takes 4-6 weeks', NOW(), NOW());

-- Late September / Early October Tasks
INSERT INTO "TaskInstance" (id, "applicationId", "stageId", title, "taskType", category, priority, "dueDate", status, progress, "estimatedCost", currency, paid, notes, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::TEXT, app_id, ee_profile_stage_id, 'Prepare Express Entry profile documents', 'APPLICATION', 'Application', 'HIGH', '2026-10-01', 'NOT_STARTED', 0, 0, 'CAD', false, 'Compile all documents for EE profile', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, ee_profile_stage_id, 'Create IRCC account', 'APPLICATION', 'Application', 'CRITICAL', '2026-10-05', 'NOT_STARTED', 0, 0, 'CAD', false, 'Create account on Canada.ca', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, ee_profile_stage_id, 'Create Express Entry profile', 'APPLICATION', 'Application', 'CRITICAL', '2026-10-05', 'NOT_STARTED', 0, 0, 'CAD', false, 'Submit Express Entry profile online', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, ee_profile_stage_id, 'Add spouse to Express Entry profile', 'APPLICATION', 'Application', 'CRITICAL', '2026-10-05', 'NOT_STARTED', 0, 0, 'CAD', false, 'Include Taiwo Ajibola as accompanying spouse', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, ee_profile_stage_id, 'Add child to Express Entry profile', 'APPLICATION', 'Application', 'HIGH', '2026-10-05', 'NOT_STARTED', 0, 0, 'CAD', false, 'Include Taiwo Ivana as dependent child', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, ee_profile_stage_id, 'Upload language test scores to profile', 'APPLICATION', 'Application', 'CRITICAL', '2026-10-05', 'NOT_STARTED', 0, 0, 'CAD', false, 'Upload TEF and IELTS results', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, ee_profile_stage_id, 'Upload ECA reports to profile', 'APPLICATION', 'Application', 'CRITICAL', '2026-10-05', 'NOT_STARTED', 0, 0, 'CAD', false, 'Upload WES evaluations', NOW(), NOW()),
  (gen_random_uuid()::TEXT, app_id, ee_profile_stage_id, 'Submit Express Entry profile and enter pool', 'APPLICATION', 'Application', 'CRITICAL', '2026-10-10', 'NOT_STARTED', 0, 0, 'CAD', false, 'Submit profile and wait for ITA', NOW(), NOW());

-- Assign tasks to family members
-- We need to get the task IDs to assign them. Let's match by title.
-- Passport tasks - assign to respective person
INSERT INTO "TaskAssignee" (id, "taskId", "applicantId", "createdAt")
SELECT gen_random_uuid()::TEXT, t.id, a.id, NOW()
FROM "TaskInstance" t, "Applicant" a
WHERE t.title LIKE '%Taiwo Ajibola%' AND a."firstName" = 'Taiwo' AND a."lastName" = 'Ajibola';
INSERT INTO "TaskAssignee" (id, "taskId", "applicantId", "createdAt")
SELECT gen_random_uuid()::TEXT, t.id, a.id, NOW()
FROM "TaskInstance" t, "Applicant" a
WHERE t.title LIKE '%Taiwo Oluwatoyin%' AND a."firstName" = 'Taiwo' AND a."lastName" = 'Oluwatoyin';
INSERT INTO "TaskAssignee" (id, "taskId", "applicantId", "createdAt")
SELECT gen_random_uuid()::TEXT, t.id, a.id, NOW()
FROM "TaskInstance" t, "Applicant" a
WHERE t.title LIKE '%Taiwo Ivana%' AND a."firstName" = 'Taiwo' AND a."lastName" = 'Ivana';

-- Family/Shared tasks - assign to everyone
INSERT INTO "TaskAssignee" (id, "taskId", "applicantId", "createdAt")
SELECT gen_random_uuid()::TEXT, t.id, a.id, NOW()
FROM "TaskInstance" t, "Applicant" a
WHERE t.title IN (
  'Obtain marriage certificate',
  'Create savings plan for settlement funds',
  'Open joint savings account',
  'Collect remaining documents',
  'Prepare Express Entry profile documents',
  'Create IRCC account',
  'Create Express Entry profile',
  'Add spouse to Express Entry profile',
  'Add child to Express Entry profile',
  'Upload language test scores to profile',
  'Upload ECA reports to profile',
  'Submit Express Entry profile and enter pool'
);

-- Print summary
RAISE NOTICE 'Seed complete. Created family members and timeline tasks.';
END $$;
