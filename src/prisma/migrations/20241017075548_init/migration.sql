/*
  Warnings:

  - A unique constraint covering the columns `[verificationToken]` on the table `Parent` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verificationTokenExpires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Parent_verificationToken_key" ON "Parent"("verificationToken");
