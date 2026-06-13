-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SEEKER', 'NURSERY', 'ADMIN');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "EngagementStatus" AS ENUM ('MATCHED', 'WORKING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('NONE', 'PARTIAL', 'DONE');

-- CreateEnum
CREATE TYPE "Party" AS ENUM ('SEEKER', 'NURSERY');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RESUME', 'LICENSE', 'HEALTH_CHECK', 'STOOL_TEST');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "authId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "agreedAt" TIMESTAMP(3),
    "lineUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeekerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "realName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "license" BOOLEAN NOT NULL DEFAULT false,
    "blankYears" TEXT,
    "preferredArea" TEXT,
    "preferredStyle" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT,
    "experience" TEXT,
    "skills" TEXT,
    "ngConditions" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeekerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NurseryProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nurseryName" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "address" TEXT,
    "contactName" TEXT NOT NULL,
    "phone" TEXT,
    "concept" TEXT,
    "policy" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NurseryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "nurseryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "workContent" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "workTimeStart" TEXT NOT NULL,
    "workTimeEnd" TEXT NOT NULL,
    "hourlyWage" INTEGER,
    "targetPerson" TEXT,
    "remarks" TEXT,
    "requiredDocuments" "DocumentType"[] DEFAULT ARRAY[]::"DocumentType"[],
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Engagement" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "applyMessage" TEXT,
    "lineContactOk" BOOLEAN NOT NULL DEFAULT false,
    "status" "EngagementStatus" NOT NULL DEFAULT 'MATCHED',
    "completedAt" TIMESTAMP(3),
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'NONE',
    "adminMemo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Engagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkReport" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "reporter" "Party" NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "comment" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileKey" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "linkUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewNurseryToSeeker" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "attitude" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "skill" INTEGER NOT NULL,
    "comment" TEXT,
    "wouldRehire" BOOLEAN NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewNurseryToSeeker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSeekerToNursery" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "explanation" INTEGER NOT NULL,
    "atmosphere" INTEGER NOT NULL,
    "support" INTEGER NOT NULL,
    "clarity" INTEGER NOT NULL,
    "comment" TEXT,
    "wouldWorkAgain" BOOLEAN NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewSeekerToNursery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authId_key" ON "User"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_lineUserId_key" ON "User"("lineUserId");

-- CreateIndex
CREATE UNIQUE INDEX "SeekerProfile_userId_key" ON "SeekerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NurseryProfile_userId_key" ON "NurseryProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_jobId_seekerId_key" ON "Engagement"("jobId", "seekerId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkReport_engagementId_reporter_key" ON "WorkReport"("engagementId", "reporter");

-- CreateIndex
CREATE UNIQUE INDEX "Document_seekerId_documentType_key" ON "Document"("seekerId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewNurseryToSeeker_engagementId_key" ON "ReviewNurseryToSeeker"("engagementId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewSeekerToNursery_engagementId_key" ON "ReviewSeekerToNursery"("engagementId");

-- AddForeignKey
ALTER TABLE "SeekerProfile" ADD CONSTRAINT "SeekerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseryProfile" ADD CONSTRAINT "NurseryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_nurseryId_fkey" FOREIGN KEY ("nurseryId") REFERENCES "NurseryProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Engagement" ADD CONSTRAINT "Engagement_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "SeekerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkReport" ADD CONSTRAINT "WorkReport_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "SeekerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewNurseryToSeeker" ADD CONSTRAINT "ReviewNurseryToSeeker_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSeekerToNursery" ADD CONSTRAINT "ReviewSeekerToNursery_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
