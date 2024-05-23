/*
  Warnings:

  - You are about to drop the column `taskListId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `TaskListsOnApps` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_taskListId_fkey";

-- DropForeignKey
ALTER TABLE "TaskListsOnApps" DROP CONSTRAINT "TaskListsOnApps_appId_fkey";

-- DropForeignKey
ALTER TABLE "TaskListsOnApps" DROP CONSTRAINT "TaskListsOnApps_taskListId_fkey";

-- AlterTable
ALTER TABLE "App" ADD COLUMN     "taskListIds" TEXT[];

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "taskListId";

-- AlterTable
ALTER TABLE "TaskList" ADD COLUMN     "taskIds" TEXT[];

-- DropTable
DROP TABLE "TaskListsOnApps";
