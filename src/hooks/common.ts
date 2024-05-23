import axios from "axios";
import { getSession } from "libs/supabase";

export const client = () => {
  const session = getSession();
  if (!session) {
    throw new Error("Session not found");
  }
  return axios.create({
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
};
