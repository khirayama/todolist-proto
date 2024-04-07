import { v4 as uuid } from "uuid";
import { createContext, useContext, ReactNode, useState } from "react";

type GlobalState = State;

const config = {
  key: "__global_state",
  initialValue: (): GlobalState => {
    const taskList = {
      id: uuid(),
      name: "やることリスト",
      tasks: [],
    };
    return {
      app: {
        preferences: {
          lang: "ja",
          theme: "system",
          taskInsertPosition: "bottom",
        },
        taskListIds: [taskList.id],
      },
      taskLists: {
        [taskList.id]: taskList,
      },
    };
  },
};

const GlobalStateContext = createContext<
  [GlobalState, (newState: GlobalState) => void]
>([config.initialValue(), () => {}]);

export const loadGlobalState = () => {
  return (
    JSON.parse(window.localStorage.getItem(config.key)) || config.initialValue()
  );
};

export const GlobalStateProvider = (props: { children: ReactNode }) => {
  const [globalState, nativeSetGlobalState] = useState(loadGlobalState);

  const setGlobalState = (newState: GlobalState) => {
    window.localStorage.setItem(config.key, JSON.stringify(newState));
    return nativeSetGlobalState(newState);
  };

  return (
    <GlobalStateContext.Provider value={[globalState, setGlobalState]}>
      {props.children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = (): [
  GlobalState,
  (newState: GlobalState) => void,
] => {
  return useContext(GlobalStateContext);
};
