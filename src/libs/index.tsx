import { v4 as uuid } from "uuid";
import { createContext, useContext, ReactNode, useState } from "react";

const initialValue = (): State => {
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
};

const GlobalStateContext = createContext<[State, (newState: State) => void]>([
  initialValue(),
  () => {},
]);

export const loadGlobalState = () =>
  JSON.parse(window.localStorage.getItem("__global_state")) || initialValue();

export const GlobalStateProvider = (props: { children: ReactNode }) => {
  const [globalState, nativeSetGlobalState] = useState(loadGlobalState);

  const setGlobalState = (newState: State) => {
    window.localStorage.setItem("__global_state", JSON.stringify(newState));
    return nativeSetGlobalState(newState);
  };

  return (
    <GlobalStateContext.Provider value={[globalState, setGlobalState]}>
      {props.children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
