/*
  Warnings:

  - You are about to drop the column `address` on the `NurseryProfile` table. All the data in the column will be lost.
  - You are about to drop the column `area` on the `NurseryProfile` table. All the data in the column will be lost.
  - You are about to drop the column `concept` on the `NurseryProfile` table. All the data in the column will be lost.
  - You are about to drop the column `policy` on the `NurseryProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NurseryProfile" DROP COLUMN "address",
DROP COLUMN "area",
DROP COLUMN "concept",
DROP COLUMN "policy",
ADD COLUMN     "additionalNotes" TEXT,
ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "featureNote" TEXT,
ADD COLUMN     "featureTags" TEXT[],
ADD COLUMN     "homepageUrl" TEXT,
ADD COLUMN     "idealPartner" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "joinReason" TEXT,
ADD COLUMN     "otherSnsUrl" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "prefecture" TEXT,
ADD COLUMN     "receptionNote" TEXT,
ADD COLUMN     "receptionTags" TEXT[],
ADD COLUMN     "twitterUrl" TEXT;
