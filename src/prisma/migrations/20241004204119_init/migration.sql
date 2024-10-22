/*
  Warnings:

  - Made the column `firstName` on table `Parent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `Parent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;
