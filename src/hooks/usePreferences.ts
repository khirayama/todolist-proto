import { useEffect, useState } from "react";
import { Preferences as PreferencesData } from "@prisma/client";

import { useGlobalState } from "libs/globalState";
import { client, debounceTime } from "hooks/common";
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPreferences = () => {
    fetchDebounce(() => {
      setIsLoading(true);
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
          setIsLoading(false);
          setIsInitialized(true);
        });
    }, debounceTime.fetch);
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
    { data: globalState.preferences, isInitialized, isLoading },
    {
      updatePreferences,
    },
  ];
};
