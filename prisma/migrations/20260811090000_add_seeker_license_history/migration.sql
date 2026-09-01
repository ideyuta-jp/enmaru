-- CreateTable
CREATE TABLE "SeekerLicenseHistory" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "licenseName" TEXT NOT NULL,
    "acquiredYearMonth" TEXT,
    "fromProfile" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SeekerLicenseHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SeekerLicenseHistory" ADD CONSTRAINT "SeekerLicenseHistory_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "SeekerResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

