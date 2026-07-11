-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN     "dresscode" TEXT,
ADD COLUMN     "qualification" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "transportationExpense" TEXT,
ADD COLUMN     "transportationExpenseNote" TEXT;

