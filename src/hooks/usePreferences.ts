import { Preferences as PreferencesData } from "@prisma/client";
import { diff, patch } from "jsondiffpatch";

import { useGlobalState } from "libs/globalState";
import { useClient } from "hooks/common";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

const transform = (data: PreferencesData): { preferences: Preferences } => {
  return {
    preferences: data,
  };
};

export const usePreferences = (
  url: string
): [
  { data: Preferences; isInitialized: boolean; isLoading: boolean },
  {
    updatePreferences: (newPreferences: Partial<Preferences>) => void;
  },
] => {
  const [globalState, setGlobalState, getGlobalStateSnapshot] =
    useGlobalState();
  const { sent, polling, isInitialized, isLoading } = useClient(url, {
    interval: 10000,
    before: () => {
      return { cache: getGlobalStateSnapshot().preferences };
    },
    resolve: (res, { cache }) => {
      const snapshot = getGlobalStateSnapshot();
      const delta = diff(cache, snapshot.preferences);
      const newPreferences = transform(res.data.preferences).preferences;
      setGlobalState({
        preferences: patch(newPreferences, delta),
      });
    },
  });

  const updatePreferences = (newPreferences: Partial<Preferences>) => {
    polling.restart();
    setGlobalState({
      preferences: {
        ...newPreferences,
      },
    });
    sent({
      method: "PATCH",
      url: "/api/preferences",
      data: newPreferences,
    }).catch((err) => {
      console.log(err);
    });
  };

  return [
    {
      data: globalState.preferences,
      isInitialized,
      isLoading,
    },
    {
      updatePreferences,
    },
  ];
};
