/*
  Warnings:

  - You are about to drop the column `resetPasswordExpires` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `Child` table. All the data in the column will be lost.
  - Added the required column `birthDate` to the `Child` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Child_resetPasswordToken_key";

-- AlterTable
ALTER TABLE "Child" DROP COLUMN "resetPasswordExpires",
DROP COLUMN "resetPasswordToken",
ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "profilePictureUrl" TEXT;
