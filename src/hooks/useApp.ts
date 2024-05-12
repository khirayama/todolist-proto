import { useGlobalState } from "libs/globalState";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

export const useApp = (): [App, {}] => {
  const [globalState] = useGlobalState();

  return [globalState.app, {}];
};
