import deepEqual from "fast-deep-equal";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { getSession } from "libs/supabase";

export const time = {
  updateDebounce: 600,
  polling: 8000,
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
  console.warn("Please migrate to useClient()");
  const session = getSession();
  return axios.create({
    withCredentials: true,
    headers: {
      "Cache-Control": "no-cache",
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
};

const requests: AxiosRequestConfig[] = [];

const newClient = () => {
  const session = getSession();
  const r = axios.create({
    withCredentials: true,
    headers: {
      "Cache-Control": "no-cache",
      Authorization: `Bearer ${session?.access_token}`,
    },
  });

  const isRequesting = (options: AxiosRequestConfig) => {
    return requests.some((op) => deepEqual(op, options));
  };

  return {
    sent: function sent<T = any>(
      options: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
      if (isRequesting(options)) {
        console.warn("Same request is already sending. but send again.");
      }
      requests.push(options);
      return new Promise((resolve, reject) => {
        return r(options)
          .then(resolve)
          .catch(reject)
          .finally(() => {
            setTimeout(() => {
              requests.splice(requests.indexOf(options), 1);
            }, 200);
          });
      });
    },
    isRequesting,
  };
};

export const useClient = () => {
  return newClient();
};
