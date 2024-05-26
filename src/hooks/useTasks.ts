import { useGlobalState } from "libs/globalState";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList, Task

export const useTasks = (): [
  { [id: string]: Task },
  {
    updateTask: (newTask: Task) => void;
    deleteTask: (taskId: string) => void;
  },
  {
    getTasksById: (taskListIds: string[]) => Task[];
  },
] => {
  const [globalState, setGlobalState, getGlobalStateSnapshot] =
    useGlobalState();

  const updateTask = (newTask: Task) => {
    const snapshot = getGlobalStateSnapshot();
    setGlobalState({
      ...snapshot,
      tasks: {
        ...snapshot.tasks,
        [newTask.id]: {
          ...(snapshot.tasks[newTask.id] || {}),
          ...newTask,
        },
      },
    });
  };

  const deleteTask = (taskId: string) => {
    const snapshot = getGlobalStateSnapshot();
    const newTasks = {
      ...snapshot.tasks,
    };
    delete newTasks[taskId];
    setGlobalState({
      ...snapshot,
      tasks: newTasks,
    });
  };

  return [
    globalState.tasks,
    {
      updateTask,
      deleteTask,
    },
    {
      getTasksById: (taskIds: string[]) => {
        return taskIds.map((tid) => globalState.tasks[tid]);
      },
    },
  ];
};
