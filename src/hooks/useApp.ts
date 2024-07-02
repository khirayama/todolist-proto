import { diff, patch } from "jsondiffpatch";

import { useGlobalState } from "libs/globalState";
import { useClient } from "hooks/common";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

export const useApp = (
  url: string
): [
  { data: App; isInitialized: boolean; isLoading: boolean },
  { updateApp: (newApp: Partial<App>) => void },
] => {
  const [, setGlobalState, getGlobalStateSnapshot] = useGlobalState();
  const { sent, polling, isInitialized, isLoading } = useClient(url, {
    before: () => {
      return { cache: getGlobalStateSnapshot().app };
    },
    resolve: (res, { cache }) => {
      const snapshot = getGlobalStateSnapshot();
      const delta = diff(cache, snapshot.app);
      const newApp = res.data.app;
      setGlobalState({
        app: patch(newApp, delta),
      });
    },
  });

  const updateApp = (newApp: Partial<App>) => {
    polling.restart();

    setGlobalState({
      app: newApp,
    });
    sent({
      method: "PATCH",
      url: "/api/app",
      data: newApp,
    }).catch((err) => {
      console.log(err);
    });
  };

  const snapshot = getGlobalStateSnapshot();
  return [
    {
      data: snapshot.app,
      isInitialized,
      isLoading,
    },
    { updateApp },
  ];
};
