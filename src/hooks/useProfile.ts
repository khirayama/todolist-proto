import { useEffect } from "react";

import { useGlobalState } from "libs/globalState";
import { type Profile as ProfileData } from "@prisma/client";
import { client, time } from "hooks/common";
import { useSupabase } from "libs/supabase";
import { createDebounce } from "libs/common";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

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
    if (getGlobalStateSnapshot().fetching.profile.isLoading) {
      setGlobalState({
        fetching: {
          profile: {
            queued: true,
          },
        },
      });
    } else {
      setGlobalState({
        fetching: {
          profile: {
            isLoading: true,
          },
        },
      });
      client()
        .get("/api/profile")
        .then((res) => {
          setGlobalState({
            profile: {
              ...transform(res.data.profile).profile,
            },
          });
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          const queued = getGlobalStateSnapshot().fetching.profile.queued;
          setGlobalState({
            fetching: {
              profile: {
                isInitialized: true,
                isLoading: false,
                queued: false,
              },
            },
          });
          if (queued) {
            fetchProfile();
          }
        });
    }
  };

  useEffect(() => {
    const snapshot = getGlobalStateSnapshot();
    if (
      isLoggedIn &&
      !snapshot.fetching.profile.isInitialized &&
      !snapshot.fetching.profile.isLoading
    ) {
      fetchProfile();
    }
  }, [isLoggedIn]);

  const updateProfile = (newProfile: Partial<Profile>) => {
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
