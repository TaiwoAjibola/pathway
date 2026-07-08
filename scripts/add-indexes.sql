-- Foreign key indexes for query performance
-- Run this against the Supabase database directly (not through pooler)
CREATE INDEX IF NOT EXISTS idx_applicant_application_id ON "Applicant"("applicationId");
CREATE INDEX IF NOT EXISTS idx_application_stage_application_id ON "ApplicationStage"("applicationId");
CREATE INDEX IF NOT EXISTS idx_application_stage_stage_id ON "ApplicationStage"("stageId");
CREATE INDEX IF NOT EXISTS idx_task_group_application_stage_id ON "TaskGroup"("applicationStageId");
CREATE INDEX IF NOT EXISTS idx_task_instance_application_id ON "TaskInstance"("applicationId");
CREATE INDEX IF NOT EXISTS idx_task_instance_stage_id ON "TaskInstance"("stageId");
CREATE INDEX IF NOT EXISTS idx_task_instance_group_id ON "TaskInstance"("groupId");
CREATE INDEX IF NOT EXISTS idx_task_assignee_task_id ON "TaskAssignee"("taskId");
CREATE INDEX IF NOT EXISTS idx_task_assignee_applicant_id ON "TaskAssignee"("applicantId");
CREATE INDEX IF NOT EXISTS idx_task_dependency_task_id ON "TaskDependency"("taskId");
CREATE INDEX IF NOT EXISTS idx_task_dependency_depends_on_id ON "TaskDependency"("dependsOnId");
CREATE INDEX IF NOT EXISTS idx_document_applicant_id ON "Document"("applicantId");
CREATE INDEX IF NOT EXISTS idx_language_test_applicant_id ON "LanguageTest"("applicantId");
CREATE INDEX IF NOT EXISTS idx_family_member_application_id ON "FamilyMember"("applicationId");
