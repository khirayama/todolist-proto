import type { NextApiRequest, NextApiResponse } from "next";

import { prisma, auth } from "libs/pages/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user, errorMessage } = await auth(req);
  if (errorMessage) {
    return res.status(401).json({ error: errorMessage });
  }

  if (req.method === "POST") {
    const newTask = req.body;
    const task = await prisma.task.create({
      data: newTask,
    });
    return res.json({ task });
  }
  if (req.method === "GET") {
    const app = await prisma.app.findUnique({
      where: {
        userId: user.id,
      },
    });
    const taskLists = await prisma.taskList.findMany({
      where: {
        id: { in: app.taskListIds },
      },
    });
    const taskIds = taskLists.map((taskList) => taskList.taskIds).flat();
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
      },
    });
    return res.json({
      tasks,
    });
  }
}
