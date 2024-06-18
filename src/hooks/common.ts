import axios from "axios";
import { getSession } from "libs/supabase";

export const time = {
  fetchDebounce: 30,
  updateDebounce: 400,
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
