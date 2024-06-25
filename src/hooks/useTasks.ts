import { useEffect } from "react";
import { diff, patch } from "jsondiffpatch";

import { useGlobalState } from "libs/globalState";
import { useSupabase } from "libs/supabase";
import { createDebounce } from "libs/common";
import { client, time, createPolling } from "hooks/common";
import { extractScheduleFromText } from "libs/extractScheduleFromText";
import { format } from "date-fns";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList, Task

const polling = createPolling();

const updateDebounce = createDebounce();

export const useTasks = (
  params: { taskListIds?: string[] } = {}
): [
  { data: { [id: string]: Task }; isInitialized: boolean; isLoading: boolean },
  {
    createTask: (newTask: Task) => void;
    updateTask: (newTask: Task) => void;
    deleteTask: (taskId: string) => void;
  },
  {
    getTasksById: (taskListIds: string[]) => Task[];
  },
] => {
  const [globalState, setGlobalState, getGlobalStateSnapshot] =
    useGlobalState();
  const { isLoggedIn } = useSupabase();

  const fetchTasks = () => {
    setGlobalState({
      fetching: {
        tasks: {
          isLoading: true,
        },
      },
    });
    const cache = getGlobalStateSnapshot().tasks;
    client()
      .get("/api/tasks", {
        params,
        paramsSerializer: { indexes: null },
      })
      .then((res) => {
        const snapshot = getGlobalStateSnapshot();
        const delta = diff(cache, snapshot.tasks);
        const newTasks = res.data.tasks.reduce(
          (acc: {}, t: Task) => ({ ...acc, [t.id]: t }),
          {}
        );
        setGlobalState({
          tasks: patch(newTasks, delta) as { [id: string]: Task },
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setGlobalState({
          fetching: {
            tasks: {
              isInitialized: true,
              isLoading: false,
            },
          },
        });
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      polling.start(fetchTasks, time.polling);
    } else {
      polling.stop();
    }
    return () => polling.stop();
  }, [isLoggedIn]);

  const createTask = (newTask: Task) => {
    polling.restart();
    if (newTask.text) {
      const { text, date } = extractScheduleFromText(newTask.text, new Date());
      newTask.text = text;
      if (date) {
        newTask.date = format(date, "yyyy-MM-dd") || "";
      }
    }
    setGlobalState({
      tasks: {
        [newTask.id]: newTask,
      },
    });
    client()
      .post("/api/tasks", newTask)
      .catch((err) => {
        console.log(err);
      });
  };

  const updateTask = (newTask: Task) => {
    polling.restart();
    if (newTask.text) {
      const { text, date } = extractScheduleFromText(newTask.text, new Date());
      newTask.text = text;
      if (date) {
        newTask.date = format(date, "yyyy-MM-dd") || "";
      }
    }
    setGlobalState({
      tasks: {
        [newTask.id]: newTask,
      },
    });
    updateDebounce(() => {
      client()
        .patch(`/api/tasks/${newTask.id}`, newTask)
        .catch((err) => {
          console.log(err);
        });
    }, time.updateDebounce);
  };

  const deleteTask = (deletedTaskId: string) => {
    polling.restart();
    setGlobalState({
      tasks: {
        [deletedTaskId]: undefined,
      },
    });
    client()
      .delete(`/api/tasks/${deletedTaskId}`)
      .catch((err) => {
        console.log(err);
      });
  };

  return [
    {
      data: globalState.tasks,
      isInitialized: globalState.fetching.tasks.isInitialized,
      isLoading: globalState.fetching.tasks.isLoading,
    },
    {
      createTask,
      updateTask,
      deleteTask,
    },
    {
      getTasksById: (taskIds: string[]) =>
        taskIds.map((tid) => globalState.tasks[tid]).filter((t) => !!t),
    },
  ];
};
