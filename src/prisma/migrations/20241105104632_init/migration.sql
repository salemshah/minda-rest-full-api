/*
  Warnings:

  - A unique constraint covering the columns `[resetPasswordToken]` on the table `Child` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Child_resetPasswordToken_key" ON "Child"("resetPasswordToken");
