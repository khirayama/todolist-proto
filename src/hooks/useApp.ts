import { useGlobalState } from "libs/globalState";
import { useEffect, useState } from "react";

import { client, debounceTime } from "hooks/common";
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchApp = () => {
    fetchDebounce(() => {
      setIsLoading(true);
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
          setIsLoading(false);
          setIsInitialized(true);
        });
    }, debounceTime.fetch);
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

  return [{ data: globalState.app, isInitialized, isLoading }, { updateApp }];
};
