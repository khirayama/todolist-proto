import { useGlobalState } from "libs/globalState";
import { useEffect } from "react";
import { type Profile as ProfileData } from "@prisma/client";

import { client } from "hooks/common";
import { useSupabase } from "libs/supabase";

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
  Profile,
  {
    updateProfile: (newProfile: Partial<Profile>) => void;
  },
] => {
  const [globalState, setGlobalState, getGlobalStateSnapshot] =
    useGlobalState();
  const { isLoggedIn } = useSupabase();

  const fetchProfile = () => {
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
      });
  };

  useEffect(() => {
    console.log(isLoggedIn);
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
    globalState.profile,
    {
      updateProfile,
    },
  ];
};
