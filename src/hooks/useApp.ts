import { useGlobalState } from "libs/globalState";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App-Preferences, TaskList-Task

export const useApp = (): [
  App,
  {
    updatePreferences: (newPreferences: Partial<Preferences>) => void;
  },
] => {
  const [globalState, setGlobalState] = useGlobalState();

  const updatePreferences = (newPreferences: Partial<Preferences>) => {
    setGlobalState({
      ...globalState,
      app: {
        ...globalState.app,
        preferences: {
          ...globalState.app.preferences,
          ...newPreferences,
        },
      },
    });
  };

  return [
    globalState.app,
    {
      updatePreferences,
    },
  ];
};
