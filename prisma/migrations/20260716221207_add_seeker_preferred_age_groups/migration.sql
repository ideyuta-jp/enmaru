-- AlterTable
ALTER TABLE "SeekerProfile" ADD COLUMN     "preferredAgeGroups" TEXT[] DEFAULT ARRAY[]::TEXT[];

