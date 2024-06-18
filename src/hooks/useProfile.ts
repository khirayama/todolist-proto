import { useEffect } from "react";

import { useGlobalState } from "libs/globalState";
import { type Profile as ProfileData } from "@prisma/client";
import { client, time } from "hooks/common";
import { useSupabase } from "libs/supabase";
import { createDebounce } from "libs/common";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

const fetchDebounce = createDebounce();

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
    fetchDebounce(() => {
      const snapshot = getGlobalStateSnapshot();
      if (snapshot.fetching.profile.isLoading) {
        setGlobalState({
          ...snapshot,
          fetching: {
            ...snapshot.fetching,
            profile: {
              ...snapshot.fetching.profile,
              queued: true,
            },
          },
        });
      } else {
        setGlobalState({
          ...snapshot,
          fetching: {
            ...snapshot.fetching,
            profile: {
              ...snapshot.fetching.profile,
              isLoading: true,
            },
          },
        });
        client()
          .get("/api/profile")
          .then((res) => {
            const snapshot = getGlobalStateSnapshot();
            setGlobalState({
              ...snapshot,
              profile: {
                ...snapshot.profile,
                ...transform(res.data.profile).profile,
              },
            });
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            const snapshot = getGlobalStateSnapshot();
            const queued = snapshot.fetching.profile.queued;
            setGlobalState({
              ...snapshot,
              fetching: {
                ...snapshot.fetching,
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
    }, time.fetchDebounce);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn]);

  const updateProfile = (newProfile: Partial<Profile>) => {
    const snapshot = getGlobalStateSnapshot();
    setGlobalState({
      ...snapshot,
      profile: {
        ...snapshot.profile,
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
