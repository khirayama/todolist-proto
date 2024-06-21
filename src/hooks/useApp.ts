import { useGlobalState } from "libs/globalState";
import { useEffect } from "react";

import { client } from "hooks/common";
import { useSupabase } from "libs/supabase";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

export const useApp = (): [
  { data: App; isInitialized: boolean; isLoading: boolean },
  { updateApp: (newApp: Partial<App>) => void },
] => {
  const [, setGlobalState, getGlobalStateSnapshot] = useGlobalState();
  const { isLoggedIn } = useSupabase();

  const fetchApp = () => {
    if (getGlobalStateSnapshot().fetching.app.isLoading) {
      setGlobalState({
        fetching: {
          app: {
            queued: true,
          },
        },
      });
    } else {
      setGlobalState({
        fetching: {
          app: {
            isLoading: true,
          },
        },
      });
      client()
        .get("/api/app")
        .then((res) => {
          setGlobalState({
            app: {
              ...res.data.app,
            },
          });
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          const queued = getGlobalStateSnapshot().fetching.app.queued;
          setGlobalState({
            fetching: {
              app: {
                isInitialized: true,
                isLoading: false,
                queued: false,
              },
            },
          });
          if (queued) {
            fetchApp();
          }
        });
    }
  };

  useEffect(() => {
    const snapshot = getGlobalStateSnapshot();
    if (
      isLoggedIn &&
      !snapshot.fetching.app.isInitialized &&
      !snapshot.fetching.app.isLoading
    ) {
      fetchApp();
    }
  }, [isLoggedIn]);

  const updateApp = (newApp: Partial<App>) => {
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
