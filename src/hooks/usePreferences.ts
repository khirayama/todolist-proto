import { useEffect } from "react";
import { Preferences as PreferencesData } from "@prisma/client";

import { useGlobalState } from "libs/globalState";
import { client, time } from "hooks/common";
import { useSupabase } from "libs/supabase";
import { createDebounce } from "libs/common";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

const fetchDebounce = createDebounce();

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
    fetchDebounce(() => {
      const snapshot = getGlobalStateSnapshot();
      if (snapshot.fetching.preferences.isLoading) {
        setGlobalState({
          ...snapshot,
          fetching: {
            ...snapshot.fetching,
            preferences: {
              ...snapshot.fetching.preferences,
              queued: true,
            },
          },
        });
      } else {
        setGlobalState({
          ...snapshot,
          fetching: {
            ...snapshot.fetching,
            preferences: {
              ...snapshot.fetching.preferences,
              isLoading: true,
            },
          },
        });
        client()
          .get("/api/preferences")
          .then((res) => {
            const snapshot = getGlobalStateSnapshot();
            setGlobalState({
              ...snapshot,
              preferences: {
                ...snapshot.preferences,
                ...transform(res.data.preferences).preferences,
              },
            });
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            const snapshot = getGlobalStateSnapshot();
            const queued = snapshot.fetching.preferences.queued;
            setGlobalState({
              ...snapshot,
              fetching: {
                ...snapshot.fetching,
                preferences: {
                  isInitialized: true,
                  isLoading: false,
                  queued: false,
                },
              },
            });
            if (queued) {
              fetchPreferences();
            }
          });
      }
    }, time.fetchDebounce);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchPreferences();
    }
  }, [isLoggedIn]);

  const updatePreferences = (newPreferences: Partial<Preferences>) => {
    const snapshot = getGlobalStateSnapshot();
    setGlobalState({
      ...snapshot,
      preferences: {
        ...snapshot.preferences,
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
