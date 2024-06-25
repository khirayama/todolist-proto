import { useGlobalState } from "libs/globalState";
import { useEffect } from "react";
import { diff, patch } from "jsondiffpatch";

import { client, time, createPolling } from "hooks/common";
import { useSupabase } from "libs/supabase";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

const polling = createPolling();

export const useApp = (): [
  { data: App; isInitialized: boolean; isLoading: boolean },
  { updateApp: (newApp: Partial<App>) => void },
] => {
  const [, setGlobalState, getGlobalStateSnapshot] = useGlobalState();
  const { isLoggedIn } = useSupabase();

  const fetchApp = () => {
    setGlobalState({
      fetching: {
        app: {
          isLoading: true,
        },
      },
    });
    const cache = getGlobalStateSnapshot().app;
    client()
      .get("/api/app")
      .then((res) => {
        const snapshot = getGlobalStateSnapshot();
        const delta = diff(cache, snapshot.app);
        const newApp = res.data.app;
        setGlobalState({
          app: patch(newApp, delta),
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setGlobalState({
          fetching: {
            app: {
              isInitialized: true,
              isLoading: false,
            },
          },
        });
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      polling.start(fetchApp, time.polling);
    } else {
      polling.stop();
    }
    return () => polling.stop();
  }, [isLoggedIn]);

  const updateApp = (newApp: Partial<App>) => {
    polling.restart();
    setGlobalState({
      app: {
        ...newApp,
      },
    });
    client()
      .patch("/api/app", newApp)
      .catch((err) => {
        console.log(err);
      });
  };

  const snapshot = getGlobalStateSnapshot();
  return [
    {
      data: snapshot.app,
      isInitialized: snapshot.fetching.app.isInitialized,
      isLoading: snapshot.fetching.app.isLoading,
    },
    { updateApp },
  ];
};
