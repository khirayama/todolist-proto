import { useEffect } from "react";
import { diff, patch } from "jsondiffpatch";

import { useGlobalState } from "libs/globalState";
import { type Profile as ProfileData } from "@prisma/client";
import { client, time, createPolling } from "hooks/common";
import { useSupabase } from "libs/supabase";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

const polling = createPolling();

const transform = (
  data: ProfileData & { email: string }
): { profile: Profile } => {
  return {
    profile: {
      displayName: data.displayName,
      email: data.email,
    },
  };
};

export const useProfile = (): [
  { data: Profile; isInitialized: boolean; isLoading: boolean },
  {
    updateProfile: (newProfile: Partial<Profile>) => void;
  },
] => {
  const [globalState, setGlobalState, getGlobalStateSnapshot] =
    useGlobalState();
  const { isLoggedIn } = useSupabase();

  const fetchProfile = () => {
    setGlobalState({
      fetching: {
        profile: {
          isLoading: true,
        },
      },
    });
    const cache = getGlobalStateSnapshot().profile;
    client()
      .get("/api/profile")
      .then((res) => {
        const snapshot = getGlobalStateSnapshot();
        const delta = diff(cache, snapshot.profile);
        const newProfile = transform(res.data.profile).profile;
        setGlobalState({
          profile: patch(newProfile, delta),
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setGlobalState({
          fetching: {
            profile: {
              isInitialized: true,
              isLoading: false,
            },
          },
        });
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      polling.start(fetchProfile, time.pollingLong);
    } else {
      polling.stop();
    }
    return () => polling.stop();
  }, [isLoggedIn]);

  const updateProfile = (newProfile: Partial<Profile>) => {
    polling.restart();
    setGlobalState({
      profile: {
        ...newProfile,
      },
    });
    client()
      .patch("/api/profile", newProfile)
      .catch((err) => {
        console.log(err);
      });
  };

  return [
    {
      data: globalState.profile,
      isInitialized: globalState.fetching.profile.isInitialized,
      isLoading: globalState.fetching.profile.isLoading,
    },
    {
      updateProfile,
    },
  ];
};
