import { useGlobalState } from "libs/globalState";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

export const useApp = (): [
  App,
  { updateApp: (newApp: Partial<App>) => void },
] => {
  const [globalState, setGlobalState] = useGlobalState();

  const updateApp = (newApp: Partial<App>) => {
    setGlobalState({
      ...globalState,
      app: {
        ...globalState.app,
        ...newApp,
      },
    });
  };

  return [globalState.app, { updateApp }];
};
