import axios from "axios";
import { getSession } from "libs/supabase";

export const time = {
  updateDebounce: 600,
  polling: 5000,
  pollingLong: 20000,
};

export const createPolling = () => {
  let intervalId = null;
  let f: Function;
  let i: number;
  const polling = {
    start: (fn: Function, interval: number) => {
      f = fn;
      i = interval;
      if (intervalId) {
        return;
      }
      f();
      polling.run();
    },
    stop: () => {
      clearInterval(intervalId);
      intervalId = null;
    },
    restart: () => {
      polling.stop();
      polling.run();
    },
    run: () => {
      intervalId = setInterval(f, i);
    },
  };
  return polling;
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
