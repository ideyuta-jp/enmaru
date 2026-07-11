-- CreateTable
CREATE TABLE "NurseryPhoto" (
    "id" TEXT NOT NULL,
    "nurseryId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NurseryPhoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NurseryPhoto" ADD CONSTRAINT "NurseryPhoto_nurseryId_fkey" FOREIGN KEY ("nurseryId") REFERENCES "NurseryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

