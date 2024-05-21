import type { NextApiRequest, NextApiResponse } from "next";

import { prisma, exclude, auth } from "libs/pages/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user, errorMessage } = await auth(req);
  if (errorMessage) {
    return res.status(401).json({ error: errorMessage });
  }

  if (req.method === "GET") {
    const app = await prisma.app.findUnique({
      where: {
        userId: user.id,
      },
    });
    return res.json({
      app: exclude(app, ["userId"]),
    });
  }
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    // do something
  }
  return res.json({ user });
}
