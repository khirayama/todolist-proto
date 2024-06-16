import axios from "axios";
import { getSession } from "libs/supabase";

export const debounceTime = {
  fetch: 50,
  update: 50,
};

export const createPolling = () => {
  let intervalId = null;
  return {
    start: (fn: Function, interval: number) => {
      if (intervalId) {
        return;
      }
      fn();
      intervalId = setInterval(fn, interval);
    },
    stop: () => clearInterval(intervalId),
  };
};

export const client = () => {
  const session = getSession();
  return axios.create({
    withCredentials: true,
    headers: {
      "Cache-Control": "no-cache",
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
};
