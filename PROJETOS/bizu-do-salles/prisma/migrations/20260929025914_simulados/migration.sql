-- CreateIndex
CREATE INDEX "QuestionAttempt_simulationAttemptId_idx" ON "QuestionAttempt"("simulationAttemptId");

-- CreateIndex
CREATE INDEX "SimulationAttempt_userId_startedAt_idx" ON "SimulationAttempt"("userId", "startedAt");

-- AddForeignKey
ALTER TABLE "QuestionAttempt" ADD CONSTRAINT "QuestionAttempt_simulationAttemptId_fkey" FOREIGN KEY ("simulationAttemptId") REFERENCES "SimulationAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
