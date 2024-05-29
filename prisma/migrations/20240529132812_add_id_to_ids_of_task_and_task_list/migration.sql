-- DropIndex
DROP INDEX "Task_id_key";

-- DropIndex
DROP INDEX "TaskList_id_key";

-- AlterTable
ALTER TABLE "Task" ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TaskList" ADD CONSTRAINT "TaskList_pkey" PRIMARY KEY ("id");
