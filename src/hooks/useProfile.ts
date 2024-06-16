import { useEffect, useState } from "react";

import { useGlobalState } from "libs/globalState";
import { type Profile as ProfileData } from "@prisma/client";
import { client, debounceTime } from "hooks/common";
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = () => {
    fetchDebounce(() => {
      setIsLoading(true);
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
          setIsLoading(false);
          setIsInitialized(true);
        });
    }, debounceTime.fetch);
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
    { data: globalState.profile, isInitialized, isLoading },
    {
      updateProfile,
    },
  ];
};
