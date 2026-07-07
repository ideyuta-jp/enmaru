/*
  Warnings:

  - You are about to drop the column `license` on the `SeekerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `preferredArea` on the `SeekerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `preferredStyle` on the `SeekerProfile` table. All the data in the column will be lost.
  - The `skills` column on the `SeekerProfile` table would be dropped and recreated. This will lead to data loss.
  - The `ngConditions` column on the `SeekerProfile` table would be dropped and recreated. This will lead to data loss.

*/
-- AlterTable
ALTER TABLE "SeekerProfile"
DROP COLUMN "license",
DROP COLUMN "preferredArea",
DROP COLUMN "preferredStyle",
DROP COLUMN "skills",
DROP COLUMN "ngConditions",
ADD COLUMN "preferredPrefecture"  TEXT,
ADD COLUMN "preferredCity"        TEXT,
ADD COLUMN "licenses"             TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "experienceYears"      TEXT,
ADD COLUMN "skillsNote"           TEXT,
ADD COLUMN "skills"               TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "preferredPeriod"      TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "preferredTimeSlot"    TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "values"               TEXT,
ADD COLUMN "messageToNursery"     TEXT,
ADD COLUMN "ngConditions"         TEXT[]  NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "ngConditionsNote"     TEXT;
