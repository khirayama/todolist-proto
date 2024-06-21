import { useEffect } from "react";
import { Preferences as PreferencesData } from "@prisma/client";

import { useGlobalState } from "libs/globalState";
import { client } from "hooks/common";
import { useSupabase } from "libs/supabase";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

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
    if (getGlobalStateSnapshot().fetching.preferences.isLoading) {
      setGlobalState({
        fetching: {
          preferences: {
            queued: true,
          },
        },
      });
    } else {
      setGlobalState({
        fetching: {
          preferences: {
            isLoading: true,
          },
        },
      });
      client()
        .get("/api/preferences")
        .then((res) => {
          setGlobalState({
            preferences: {
              ...transform(res.data.preferences).preferences,
            },
          });
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          const queued = getGlobalStateSnapshot().fetching.preferences.queued;
          setGlobalState({
            fetching: {
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
  };

  useEffect(() => {
    const snapshot = getGlobalStateSnapshot();
    if (
      isLoggedIn &&
      !snapshot.fetching.preferences.isInitialized &&
      !snapshot.fetching.preferences.isLoading
    ) {
      fetchPreferences();
    }
  }, [isLoggedIn]);

  const updatePreferences = (newPreferences: Partial<Preferences>) => {
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
