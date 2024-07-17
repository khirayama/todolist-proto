import { diff, patch } from "jsondiffpatch";
import { type Profile as ProfileData } from "@prisma/client";

import { useGlobalState } from "libs/globalState";
import { useClient } from "hooks/common";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

const transform = (
  data: ProfileData & { email: string },
): { profile: Profile } => {
  return {
    profile: {
      displayName: data.displayName,
      email: data.email,
    },
  };
};

export const useProfile = (
  url: string,
): [
  { data: Profile; isInitialized: boolean; isLoading: boolean },
  {
    updateProfile: (newProfile: Partial<Profile>) => void;
  },
] => {
  const [globalState, setGlobalState, getGlobalStateSnapshot] =
    useGlobalState();
  const { sent, polling, isInitialized, isLoading } = useClient(url, {
    interval: 10000,
    before: () => {
      return { cache: getGlobalStateSnapshot().profile };
    },
    resolve: (res, { cache }) => {
      const snapshot = getGlobalStateSnapshot();
      const delta = diff(cache, snapshot.profile);
      const newProfile = transform(res.data.profile).profile;
      setGlobalState({
        profile: patch(newProfile, delta),
      });
    },
  });

  const updateProfile = (newProfile: Partial<Profile>) => {
    polling.restart();
    setGlobalState({
      profile: {
        ...newProfile,
      },
    });
    sent({
      method: "PATCH",
      url: "/api/profile",
      data: newProfile,
    }).catch((err) => {
      console.log(err);
    });
  };

  return [
    {
      data: globalState.profile,
      isInitialized,
      isLoading,
    },
    {
      updateProfile,
    },
  ];
};
