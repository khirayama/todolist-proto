import { useGlobalState } from "libs/globalState";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList, Task

export const useTaskLists = (): [
  { [id: string]: TaskList },
  {
    updateTaskList: (newTaskList: TaskList) => void;
    updateTaskLists: (newTaskLists: TaskList[]) => void;
  },
  {
    getTaskListsById: (taskListIds: string[]) => TaskList[];
  },
] => {
  const [globalState, setGlobalState, getGlobalStateSnapshot] =
    useGlobalState();

  const updateTaskList = (newTaskList: TaskList) => {
    const snapshot = getGlobalStateSnapshot();
    setGlobalState({
      ...snapshot,
      taskLists: {
        ...snapshot.taskLists,
        [newTaskList.id]: newTaskList,
      },
    });
  };

  const updateTaskLists = (newTaskLists: TaskList[]) => {
    const snapshot = getGlobalStateSnapshot();
    const newTaskListsMap = {
      ...snapshot.taskLists,
    };
    newTaskLists.forEach((tl) => (newTaskListsMap[tl.id] = tl));

    snapshot.app.taskListIds
      .filter((tlid) => newTaskLists.map((tl) => tl.id).indexOf(tlid) === -1)
      .forEach((tlid) => {
        delete newTaskListsMap[tlid];
      });

    setGlobalState({
      ...snapshot,
      app: {
        ...snapshot.app,
        taskListIds: newTaskLists.map((tl) => tl.id),
      },
      taskLists: newTaskListsMap,
    });
  };

  return [
    globalState.taskLists,
    {
      updateTaskList,
      updateTaskLists,
    },
    {
      getTaskListsById: (taskListIds: string[]) => {
        return taskListIds.map((tlid) => globalState.taskLists[tlid]);
      },
    },
  ];
};
