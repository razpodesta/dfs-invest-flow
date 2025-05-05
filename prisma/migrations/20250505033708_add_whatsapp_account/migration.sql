/*
  Warnings:

  - You are about to alter the column `healthScore` on the `WhatsAppAccount` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.

*/
-- AlterTable
ALTER TABLE "WhatsAppAccount" ALTER COLUMN "healthScore" SET DATA TYPE SMALLINT;
