import { useEffect } from "react";

import { useGlobalState } from "libs/globalState";
import { useSupabase } from "libs/supabase";
import { createDebounce } from "libs/common";
import { client, time } from "hooks/common";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList, Task

const fetchDebounce = createDebounce();
const updateDebounce = createDebounce();

export const useTaskLists = (
  params: {
    shareCodes?: string[];
  } = {}
): [
  {
    data: { [id: string]: TaskList };
    isInitialized: boolean;
    isLoading: boolean;
  },
  {
    createTaskList: (newTaskList: TaskList) => void;
    updateTaskList: (newTaskList: TaskList) => void;
    deleteTaskList: (deletedTaskListId: string) => void;
    refreshShareCode: (taskListId: string) => void;
  },
  {
    getTaskListsById: (taskListIds: string[]) => TaskList[];
  },
] => {
  const [globalState, setGlobalState, getGlobalStateSnapshot] =
    useGlobalState();
  const { isLoggedIn } = useSupabase();

  const fetchTaskLists = () => {
    fetchDebounce(() => {
      const snapshot = getGlobalStateSnapshot();

      if (snapshot.fetching.taskLists.isLoading) {
        setGlobalState({
          ...snapshot,
          fetching: {
            ...snapshot.fetching,
            taskLists: {
              ...snapshot.fetching.taskLists,
              queued: true,
            },
          },
        });
      } else {
        setGlobalState({
          ...snapshot,
          fetching: {
            ...snapshot.fetching,
            taskLists: {
              ...snapshot.fetching.taskLists,
              isLoading: true,
            },
          },
        });
        client()
          .get("/api/task-lists", {
            params,
            paramsSerializer: { indexes: null },
          })
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
          })
          .finally(() => {
            const snapshot = getGlobalStateSnapshot();
            const queued = snapshot.fetching.taskLists.queued;
            setGlobalState({
              ...snapshot,
              fetching: {
                ...snapshot.fetching,
                taskLists: {
                  isInitialized: true,
                  isLoading: false,
                  queued: false,
                },
              },
            });
            if (queued) {
              fetchTaskLists();
            }
          });
      }
    }, time.fetchDebounce);
  };

  useEffect(() => {
    if (isLoggedIn || params.shareCodes) {
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
    }, time.updateDebounce);
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

  const refreshShareCode = (taskListId: string) => {
    const shareCode = globalState.taskLists[taskListId].shareCode;
    client()
      .put(`/api/share-codes/${shareCode}`)
      .then((res) => {
        const snapshot = getGlobalStateSnapshot();
        setGlobalState({
          ...snapshot,
          taskLists: {
            ...snapshot.taskLists,
            [taskListId]: {
              ...snapshot.taskLists[taskListId],
              shareCode: res.data.shareCode.code,
            },
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return [
    {
      data: globalState.taskLists,
      isInitialized: globalState.fetching.taskLists.isInitialized,
      isLoading: globalState.fetching.taskLists.isLoading,
    },
    {
      createTaskList,
      updateTaskList,
      deleteTaskList,
      refreshShareCode,
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
