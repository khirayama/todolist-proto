import { useEffect } from "react";

import { useGlobalState } from "libs/globalState";
import { useSupabase } from "libs/supabase";
import { client, createDebounce } from "hooks/common";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList, Task

const updateDebounce = createDebounce();

export const useTaskLists = (): [
  { [id: string]: TaskList },
  {
    createTaskList: (newTaskList: TaskList) => void;
    updateTaskList: (newTaskList: TaskList) => void;
    deleteTaskList: (deletedTaskListId: string) => void;
  },
  {
    getTaskListsById: (taskListIds: string[]) => TaskList[];
  },
] => {
  const [globalState, setGlobalState, getGlobalStateSnapshot] =
    useGlobalState();
  const { isLoggedIn } = useSupabase();

  const fetchTaskLists = () => {
    client()
      .get("/api/task-lists")
      .then((res) => {
        const taskLists: TaskList[] = res.data.taskLists;
        const snapshot = getGlobalStateSnapshot();
        setGlobalState({
          ...snapshot,
          taskLists: {
            ...snapshot.taskLists,
            ...taskLists.reduce((acc, tl) => ({ ...acc, [tl.id]: tl }), {}),
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTaskLists();
    }
  }, [isLoggedIn]);

  const createTaskList = (newTaskList: TaskList) => {
    const snapshot = getGlobalStateSnapshot();
    setGlobalState({
      ...snapshot,
      taskLists: {
        ...snapshot.taskLists,
        [newTaskList.id]: newTaskList,
      },
    });
    client()
      .post("/api/task-lists", newTaskList)
      .catch((err) => {
        console.log(err);
      });
  };

  const updateTaskList = (newTaskList: TaskList) => {
    const snapshot = getGlobalStateSnapshot();
    setGlobalState({
      ...snapshot,
      taskLists: {
        ...snapshot.taskLists,
        [newTaskList.id]: newTaskList,
      },
    });
    updateDebounce(() => {
      client()
        .patch(`/api/task-lists/${newTaskList.id}`, newTaskList)
        .catch((err) => {
          console.log(err);
        });
    }, 400);
  };

  const deleteTaskList = (deletedTaskListId: string) => {
    const snapshot = getGlobalStateSnapshot();
    setGlobalState({
      ...snapshot,
      taskLists: {
        ...snapshot.taskLists,
        [deletedTaskListId]: undefined,
      },
    });
    client()
      .delete(`/api/task-lists/${deletedTaskListId}`)
      .catch(() => {
        const snapshot = getGlobalStateSnapshot();
        setGlobalState({
          ...globalState,
          taskLists: {
            ...snapshot.taskLists,
          },
        });
      });
  };

  return [
    globalState.taskLists,
    {
      createTaskList,
      updateTaskList,
      deleteTaskList,
    },
    {
      getTaskListsById: (taskListIds: string[]) => {
        return taskListIds
          .map((tlid) => globalState.taskLists[tlid])
          .filter((tl) => !!tl);
      },
    },
  ];
};
