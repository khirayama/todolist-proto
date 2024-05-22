/*
  Warnings:

  - You are about to drop the column `taskInsert` on the `App` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "App" DROP COLUMN "taskInsert",
ADD COLUMN     "taskInsertPosition" "TaskInsertPosition" NOT NULL DEFAULT 'BOTTOM';
