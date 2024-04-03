import { useGlobalState } from "./libs";

export const use = (): [
  State,
  {
    updatePreferences: (newPreferences: Partial<Preferences>) => void;
    updateTaskList: (newTaskList: TaskList) => void;
    updateTaskLists: (newTaskLists: TaskList[]) => void;
    updateTask: (taskList: TaskList, newTask: Task) => void;
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
