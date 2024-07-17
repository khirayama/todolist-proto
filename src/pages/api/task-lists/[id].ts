import type { NextApiRequest, NextApiResponse } from "next";
import type { TaskList as TaskListType } from "@prisma/client";

import { prisma, exclude, auth } from "libs/pages/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const taskListId = req.query.id as string;
  const unsafeKeys: (keyof TaskListType)[] = ["id"];
  const shareCode = req.body?.shareCode;
  delete req.body?.shareCode;

  const { errorMessage } = await auth(req);
  if (errorMessage) {
    const sc = await prisma.shareCode.findFirst({
      where: {
        taskListId,
      },
    });
    if (shareCode !== sc.code) {
      return res.status(401).json({ error: errorMessage });
    }
  }

  if (req.method === "PATCH") {
    const taskList = await prisma.taskList.update({
      where: {
        id: taskListId,
      },
      data: exclude(req.body, unsafeKeys),
    });
    return res.json({ taskList });
  }

  if (req.method === "DELETE") {
    const apps = await prisma.app.findMany({
      where: {
        taskListIds: {
          has: taskListId,
        },
      },
    });
    if (apps.length === 1) {
      const taskList = await prisma.taskList.findUnique({
        where: {
          id: taskListId,
        },
      });
      await prisma.$transaction([
        prisma.task.deleteMany({
          where: {
            id: {
              in: taskList.taskIds,
            },
          },
        }),
        prisma.shareCode.deleteMany({
          where: {
            taskListId,
          },
        }),
        prisma.taskList.delete({
          where: {
            id: taskListId,
          },
        }),
      ]);
    }
    return res.status(204).end();
  }
}
