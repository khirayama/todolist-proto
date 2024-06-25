import { useEffect } from "react";
import { diff, patch } from "jsondiffpatch";

import { useGlobalState } from "libs/globalState";
import { useSupabase } from "libs/supabase";
import { createDebounce } from "libs/common";
import { client, time, createPolling } from "hooks/common";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList, Task

const polling = createPolling();

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
  const [, setGlobalState, getGlobalStateSnapshot] = useGlobalState();
  const { isLoggedIn } = useSupabase();

  const fetchTaskLists = () => {
    if (getGlobalStateSnapshot().fetching.taskLists.isLoading) {
      setGlobalState({
        fetching: {
          taskLists: {
            queued: true,
          },
        },
      });
    } else {
      setGlobalState({
        fetching: {
          taskLists: {
            isLoading: true,
          },
        },
      });
      const cache = getGlobalStateSnapshot().taskLists;
      client()
        .get("/api/task-lists", {
          params,
          paramsSerializer: { indexes: null },
        })
        .then((res) => {
          const snapshot = getGlobalStateSnapshot();
          const delta = diff(cache, snapshot.taskLists);
          const newTaskLists = res.data.taskLists.reduce(
            (acc: {}, tl: TaskList) => ({ ...acc, [tl.id]: tl }),
            {}
          );
          setGlobalState({
            taskLists: patch(newTaskLists, delta) as { [id: string]: TaskList },
          });
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          const queued = getGlobalStateSnapshot().fetching.taskLists.queued;
          setGlobalState({
            fetching: {
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
  };

  useEffect(() => {
    const snapshot = getGlobalStateSnapshot();
    if (
      isLoggedIn &&
      !snapshot.fetching.taskLists.isInitialized &&
      !snapshot.fetching.taskLists.isLoading
    ) {
      fetchTaskLists();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      polling.start(fetchTaskLists, time.polling);
    } else {
      polling.stop();
    }
    return () => polling.stop();
  }, [isLoggedIn]);

  const createTaskList = (newTaskList: TaskList) => {
    polling.restart();
    setGlobalState({
      taskLists: {
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
    polling.restart();
    setGlobalState({
      taskLists: {
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
    polling.restart();
    setGlobalState({
      taskLists: {
        [deletedTaskListId]: undefined,
      },
    });
    client()
      .delete(`/api/task-lists/${deletedTaskListId}`)
      .catch((err) => {
        console.log(err);
      });
  };

  const refreshShareCode = (taskListId: string) => {
    polling.restart();
    const shareCode = getGlobalStateSnapshot().taskLists[taskListId].shareCode;
    client()
      .put(`/api/share-codes/${shareCode}`)
      .then((res) => {
        setGlobalState({
          taskLists: {
            [taskListId]: {
              shareCode: res.data.shareCode.code,
            },
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const snapshot = getGlobalStateSnapshot();
  return [
    {
      data: snapshot.taskLists,
      isInitialized: snapshot.fetching.taskLists.isInitialized,
      isLoading: snapshot.fetching.taskLists.isLoading,
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
          .map((tlid) => snapshot.taskLists[tlid])
          .filter((tl) => !!tl);
      },
    },
  ];
};
