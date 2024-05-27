import axios from "axios";
import { getSession } from "libs/supabase";

export const client = () => {
  const session = getSession();
  return axios.create({
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
};

export const createDebounce = () => {
  let timeoutId = null;
  return (fn: Function, t: number) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn();
    }, t);
  };
};
