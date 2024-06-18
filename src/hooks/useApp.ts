import { useGlobalState } from "libs/globalState";
import { useEffect } from "react";

import { client, time } from "hooks/common";
import { useSupabase } from "libs/supabase";
import { createDebounce } from "libs/common";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

const fetchDebounce = createDebounce();

export const useApp = (): [
  { data: App; isInitialized: boolean; isLoading: boolean },
  { updateApp: (newApp: Partial<App>) => void },
] => {
  const [globalState, setGlobalState, getGlobalStateSnapshot] =
    useGlobalState();
  const { isLoggedIn } = useSupabase();

  const fetchApp = () => {
    fetchDebounce(() => {
      const snapshot = getGlobalStateSnapshot();
      if (snapshot.fetching.app.isLoading) {
        setGlobalState({
          ...snapshot,
          fetching: {
            ...snapshot.fetching,
            app: {
              ...snapshot.fetching.app,
              queued: true,
            },
          },
        });
      } else {
        setGlobalState({
          ...snapshot,
          fetching: {
            ...snapshot.fetching,
            app: {
              ...snapshot.fetching.app,
              isLoading: true,
            },
          },
        });
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
          })
          .finally(() => {
            const snapshot = getGlobalStateSnapshot();
            const queued = snapshot.fetching.app.queued;
            setGlobalState({
              ...snapshot,
              fetching: {
                ...snapshot.fetching,
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
    }, time.fetchDebounce);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchApp();
    }
  }, [isLoggedIn]);

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
      .catch((err) => {
        console.log(err);
      });
  };

  return [
    {
      data: globalState.app,
      isInitialized: globalState.fetching.app.isInitialized,
      isLoading: globalState.fetching.app.isLoading,
    },
    { updateApp },
  ];
};
