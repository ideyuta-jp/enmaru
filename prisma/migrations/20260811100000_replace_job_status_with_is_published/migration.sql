-- Replace JobPosting.status (OPEN/CLOSED) with isPublished (#185). The enum
-- conflated three independent facts — published by the nursery, matched, and
-- expired — so writes for one fact destroyed another (re-publishing a matched
-- posting allowed a double match). Only "published" stays stored; matched is
-- derived from the Engagement's existence and expired from workDate.

-- AlterTable: add the new column first so the old status can be carried over.
ALTER TABLE "JobPosting" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- Backfill: a CLOSED posting with no Engagement can only have been closed by
-- the nursery's own toggle (matching was the only other writer of CLOSED), so
-- carry that choice over. Matched postings keep isPublished = true — their
-- closed-ness now comes from the Engagement, not from this column.
UPDATE "JobPosting" p
SET "isPublished" = false
WHERE p."status" = 'CLOSED'
  AND NOT EXISTS (SELECT 1 FROM "Engagement" e WHERE e."jobId" = p."id");

ALTER TABLE "JobPosting" DROP COLUMN "status";

-- DropEnum
DROP TYPE "JobStatus";

-- First-come single match: at most one Engagement per posting, enforced by
-- the database so two concurrent applies cannot both succeed. Subsumes the
-- old (jobId, seekerId) uniqueness.
DROP INDEX "Engagement_jobId_seekerId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_jobId_key" ON "Engagement"("jobId");
