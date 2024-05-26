import { useGlobalState } from "libs/globalState";
import { useEffect } from "react";

import { client } from "hooks/common";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

export const useApp = (): [
  App,
  { updateApp: (newApp: Partial<App>) => void },
] => {
  const [globalState, setGlobalState, getGlobalStateSnapshot] =
    useGlobalState();

  const fetchApp = () => {
    client()
      .get("/api/app")
      .then((res) => {
        const snapshot = getGlobalStateSnapshot();
        setGlobalState({
          ...snapshot,
          app: {
            ...snapshot.app,
            ...res.data.app,
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchApp();
  }, []);

  const updateApp = (newApp: Partial<App>) => {
    const snapshot = getGlobalStateSnapshot();
    setGlobalState({
      ...snapshot,
      app: {
        ...snapshot.app,
        ...newApp,
      },
    });
    client()
      .patch("/api/app", newApp)
      .then((res) => {
        const snapshot = getGlobalStateSnapshot();
        setGlobalState({
          ...snapshot,
          app: {
            ...snapshot.app,
            ...res.data.app,
          },
        });
      });
  };

  return [globalState.app, { updateApp }];
};
