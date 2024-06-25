import { useEffect } from "react";
import { Preferences as PreferencesData } from "@prisma/client";
import { diff, patch } from "jsondiffpatch";

import { useGlobalState } from "libs/globalState";
import { client, time, createPolling } from "hooks/common";
import { useSupabase } from "libs/supabase";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

const polling = createPolling();

const transform = (data: PreferencesData): { preferences: Preferences } => {
  return {
    preferences: data,
  };
};

export const usePreferences = (): [
  { data: Preferences; isInitialized: boolean; isLoading: boolean },
  {
    updatePreferences: (newPreferences: Partial<Preferences>) => void;
  },
] => {
  const [globalState, setGlobalState, getGlobalStateSnapshot] =
    useGlobalState();
  const { isLoggedIn } = useSupabase();

  const fetchPreferences = () => {
    setGlobalState({
      fetching: {
        preferences: {
          isLoading: true,
        },
      },
    });
    const cache = getGlobalStateSnapshot().preferences;
    client()
      .get("/api/preferences")
      .then((res) => {
        const snapshot = getGlobalStateSnapshot();
        const delta = diff(cache, snapshot.preferences);
        const newPreferences = transform(res.data.preferences).preferences;
        setGlobalState({
          preferences: patch(newPreferences, delta),
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setGlobalState({
          fetching: {
            preferences: {
              isInitialized: true,
              isLoading: false,
            },
          },
        });
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      polling.start(fetchPreferences, time.pollingLong);
    } else {
      polling.stop();
    }
    return () => polling.stop();
  }, [isLoggedIn]);

  const updatePreferences = (newPreferences: Partial<Preferences>) => {
    polling.restart();
    setGlobalState({
      preferences: {
        ...newPreferences,
      },
    });
    client()
      .patch("/api/preferences", newPreferences)
      .catch((err) => {
        console.log(err);
      });
  };

  return [
    {
      data: globalState.preferences,
      isInitialized: globalState.fetching.preferences.isInitialized,
      isLoading: globalState.fetching.preferences.isLoading,
    },
    {
      updatePreferences,
    },
  ];
};
