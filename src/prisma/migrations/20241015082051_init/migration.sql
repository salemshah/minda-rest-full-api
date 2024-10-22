/*
  Warnings:

  - A unique constraint covering the columns `[resetPasswordToken]` on the table `Parent` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Parent_resetPasswordToken_key" ON "Parent"("resetPasswordToken");
