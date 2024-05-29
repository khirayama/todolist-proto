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
    const newTaskList = req.body;
    const taskList = await prisma.taskList.create({
      data: newTaskList,
    });
    return res.json({ taskList });
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

    // for (const taskList of taskLists) {
    //   const tmp = await prisma.app.findMany({
    //     where: {
    //       taskListIds: {
    //         has: taskList.id,
    //       },
    //     },
    //   });
    //   console.log(tmp);
    // }

    return res.json({
      taskLists,
    });
  }
}
