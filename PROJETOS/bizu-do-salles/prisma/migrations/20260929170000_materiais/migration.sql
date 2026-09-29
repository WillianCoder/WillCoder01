-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "body" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "storageKey" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "Material_published_cycle_idx" ON "Material"("published", "cycle");

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

