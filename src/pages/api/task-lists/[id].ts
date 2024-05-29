import type { NextApiRequest, NextApiResponse } from "next";
import type { TaskList as TaskListType } from "@prisma/client";

import { prisma, exclude, auth } from "libs/pages/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { errorMessage } = await auth(req);
  if (errorMessage) {
    return res.status(401).json({ error: errorMessage });
  }

  const unsafeKeys: (keyof TaskListType)[] = ["id"];

  if (req.method === "PATCH") {
    const taskList = await prisma.taskList.update({
      where: {
        id: req.query.id as string,
      },
      data: exclude(req.body, unsafeKeys),
    });
    return res.json({ taskList });
  }
  if (req.method === "DELETE") {
    const apps = await prisma.app.findMany({
      where: {
        taskListIds: {
          has: req.query.id as string,
        },
      },
    });
    if (apps.length === 1) {
      const taskList = await prisma.taskList.findUnique({
        where: {
          id: req.query.id as string,
        },
      });
      await prisma.task.deleteMany({
        where: {
          id: {
            in: taskList.taskIds,
          },
        },
      });
      await prisma.taskList.delete({
        where: {
          id: req.query.id as string,
        },
      });
    } else {
      console.log("no deleted");
    }
    return res.status(204).end();
  }
}
