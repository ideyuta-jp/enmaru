-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN     "dresscode" TEXT,
ADD COLUMN     "qualification" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "targetPersonNote" TEXT,
ADD COLUMN     "targetPersonTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "transportationExpense" BOOLEAN,
ADD COLUMN     "transportationExpenseNote" TEXT,
ADD COLUMN     "workContentNote" TEXT,
ADD COLUMN     "workContentTags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Preserve existing packed free-text content in the new note columns before
-- dropping the old columns (the tag/note split cannot be reconstructed, so
-- everything lands on the note side).
UPDATE "JobPosting" SET "workContentNote" = "workContent", "targetPersonNote" = "targetPerson";

-- DropColumn
ALTER TABLE "JobPosting" DROP COLUMN "workContent",
DROP COLUMN "targetPerson";
