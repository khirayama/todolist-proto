import { useGlobalState } from "libs/globalState";
import { useEffect } from "react";
import { Preferences as PreferencesData } from "@prisma/client";

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
  Preferences,
  {
    updatePreferences: (newPreferences: Partial<Preferences>) => void;
  },
] => {
  const [globalState, setGlobalState, getGlobalStateSnapshot] =
    useGlobalState();
  const { isLoggedIn } = useSupabase();

  const fetchPreferences = () => {
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
      });
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
      });
  };

  return [
    globalState.preferences,
    {
      updatePreferences,
    },
  ];
};
