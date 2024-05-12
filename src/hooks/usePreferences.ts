import { useGlobalState } from "libs/globalState";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

export const usePreferences = (): [
  Preferences,
  {
    updatePreferences: (newPreferences: Partial<Preferences>) => void;
  },
] => {
  const [globalState, setGlobalState] = useGlobalState();

  const updatePreferences = (newPreferences: Partial<Preferences>) => {
    setGlobalState({
      ...globalState,
      preferences: {
        ...globalState.preferences,
        ...newPreferences,
      },
    });
  };

  return [
    globalState.preferences,
    {
      updatePreferences,
    },
  ];
};
