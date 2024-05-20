/*
  Warnings:

  - The primary key for the `App` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `App` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Preferences` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Preferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TaskListsOnApps` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `appId` on the `TaskListsOnApps` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "TaskListsOnApps" DROP CONSTRAINT "TaskListsOnApps_appId_fkey";

-- AlterTable
ALTER TABLE "App" DROP CONSTRAINT "App_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "App_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Preferences" DROP CONSTRAINT "Preferences_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Preferences_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Profile_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TaskListsOnApps" DROP CONSTRAINT "TaskListsOnApps_pkey",
DROP COLUMN "appId",
ADD COLUMN     "appId" INTEGER NOT NULL,
ADD CONSTRAINT "TaskListsOnApps_pkey" PRIMARY KEY ("appId", "taskListId");

-- AddForeignKey
ALTER TABLE "TaskListsOnApps" ADD CONSTRAINT "TaskListsOnApps_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
