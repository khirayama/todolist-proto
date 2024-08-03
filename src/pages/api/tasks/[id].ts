import type { NextApiRequest, NextApiResponse } from "next";
import type { Task as TaskType } from "@prisma/client";

import { prisma, exclude } from "libs/apiHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const unsafeKeys: (keyof TaskType)[] = ["id"];

  if (req.method === "PATCH") {
    const task = await prisma.task.update({
      where: {
        id: req.query.id as string,
      },
      data: exclude(req.body, unsafeKeys),
    });
    return res.json({ task });
  }
  if (req.method === "DELETE") {
    await prisma.task.delete({
      where: {
        id: req.query.id as string,
      },
    });
    return res.status(204).end();
  }
}
