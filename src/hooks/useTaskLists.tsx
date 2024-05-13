import { useGlobalState } from "libs/globalState";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList-Task

export const useTaskLists = (): [
  { [id: string]: TaskList },
  {
    updateTaskList: (newTaskList: TaskList) => void;
    updateTaskLists: (newTaskLists: TaskList[]) => void;
    updateTask: (taskList: TaskList, newTask: Task) => void;
  },
  {
    getTaskListsById: (taskListIds: string[]) => TaskList[];
  },
] => {
  const [globalState, setGlobalState] = useGlobalState();

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
    newTaskLists.forEach((tl) => (newTaskListsMap[tl.id] = tl));

    globalState.app.taskListIds
      .filter((tlid) => newTaskLists.map((tl) => tl.id).indexOf(tlid) === -1)
      .forEach((tlid) => {
        delete newTaskListsMap[tlid];
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
    globalState.taskLists,
    {
      updateTaskList,
      updateTaskLists,
      updateTask,
    },
    {
      getTaskListsById: (taskListIds: string[]) => {
        return taskListIds.map((tlid) => globalState.taskLists[tlid]);
      },
    },
  ];
};
