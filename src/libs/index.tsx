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

export const loadGlobalState = () => {
  return (
    JSON.parse(window.localStorage.getItem("__global_state")) || initialValue()
  );
};

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

export const useGlobalState = (): [
  State,
  {
    updatePreferences: (newPreferences: Partial<Preferences>) => void;
    updateTaskList: (newTaskList: TaskList) => void;
    updateTaskLists: (newTaskLists: TaskList[]) => void;
    updateTask: (taskList: TaskList, newTask: Task) => void;
  },
] => {
  const [globalState, setGlobalState] = useContext(GlobalStateContext);

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

  const updateTaskList = (newTaskList: TaskList) => {
    setGlobalState({
      ...globalState,
      taskLists: {
        ...globalState.taskLists,
        [newTaskList.id]: newTaskList,
      },
    });
  };

  const updateTaskLists = (newTaskLists: TaskList[]) => {
    const newTaskListsMap = {
      ...globalState.taskLists,
    };
    newTaskLists.forEach((tl) => {
      newTaskListsMap[tl.id] = tl;
    });

    setGlobalState({
      ...globalState,
      app: {
        ...globalState.app,
        taskListIds: newTaskLists.map((tl) => tl.id),
      },
      taskLists: newTaskListsMap,
    });
  };

  const updateTask = (taskList: TaskList, newTask: Task) => {
    setGlobalState({
      ...globalState,
      taskLists: {
        ...globalState.taskLists,
        [taskList.id]: {
          ...taskList,
          tasks: taskList.tasks.map((t) => {
            if (t.id === newTask.id) {
              return newTask;
            }
            return t;
          }),
        },
      },
    });
  };

  return [
    globalState,
    {
      updatePreferences,
      updateTaskList,
      updateTaskLists,
      updateTask,
    },
  ];
};
