/*
  Warnings:

  - You are about to drop the column `createdAt` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Preferences` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Preferences` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TaskList` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TaskList` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "App" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Preferences" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "TaskList" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
