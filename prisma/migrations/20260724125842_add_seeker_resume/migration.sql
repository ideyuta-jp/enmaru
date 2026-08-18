-- CreateTable
CREATE TABLE "SeekerResume" (
    "id" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "postalCode" TEXT,
    "prefecture" TEXT,
    "city" TEXT,
    "addressLine" TEXT,
    "phone" TEXT,
    "photoFileKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeekerResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeekerEducationHistory" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "graduationStatus" TEXT,
    "startYearMonth" TEXT,
    "endYearMonth" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SeekerEducationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeekerWorkHistory" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "employmentType" TEXT,
    "description" TEXT,
    "startYearMonth" TEXT,
    "endYearMonth" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SeekerWorkHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeekerResume_seekerId_key" ON "SeekerResume"("seekerId");

-- AddForeignKey
ALTER TABLE "SeekerResume" ADD CONSTRAINT "SeekerResume_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "SeekerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeekerEducationHistory" ADD CONSTRAINT "SeekerEducationHistory_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "SeekerResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeekerWorkHistory" ADD CONSTRAINT "SeekerWorkHistory_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "SeekerResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

