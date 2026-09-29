-- AlterTable
ALTER TABLE "NotebookQuestion" ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rankingOptIn" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Notebook_userId_idx" ON "Notebook"("userId");

