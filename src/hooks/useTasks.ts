import { useEffect } from "react";

import { useGlobalState } from "libs/globalState";
import { useSupabase } from "libs/supabase";
import { createDebounce } from "libs/common";
import { client, time } from "hooks/common";
import { extractScheduleFromText } from "libs/extractScheduleFromText";
import { format } from "date-fns";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList, Task

const fetchDebounce = createDebounce();
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
    fetchDebounce(() => {
      const snapshot = getGlobalStateSnapshot();
      if (snapshot.fetching.tasks.isLoading) {
        setGlobalState({
          ...snapshot,
          fetching: {
            ...snapshot.fetching,
            tasks: {
              ...snapshot.fetching.tasks,
              queued: true,
            },
          },
        });
      } else {
        setGlobalState({
          ...snapshot,
          fetching: {
            ...snapshot.fetching,
            tasks: {
              ...snapshot.fetching.tasks,
              isLoading: true,
            },
          },
        });
        client()
          .get("/api/tasks", {
            params,
            paramsSerializer: { indexes: null },
          })
          .then((res) => {
            const tasks: Task[] = res.data.tasks;
            const snapshot = getGlobalStateSnapshot();
            setGlobalState({
              ...snapshot,
              tasks: {
                ...snapshot.tasks,
                ...tasks.reduce((acc, t) => ({ ...acc, [t.id]: t }), {}),
              },
            });
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            const snapshot = getGlobalStateSnapshot();
            const queued = snapshot.fetching.tasks.queued;
            setGlobalState({
              ...snapshot,
              fetching: {
                ...snapshot.fetching,
                tasks: {
                  isInitialized: true,
                  isLoading: false,
                  queued: false,
                },
              },
            });
            if (queued) {
              fetchTasks();
            }
          });
      }
    }, time.fetchDebounce);
  };

  useEffect(() => {
    if (isLoggedIn || params.taskListIds) {
      fetchTasks();
    }
  }, [isLoggedIn]);

  const createTask = (newTask: Task) => {
    if (newTask.text) {
      const { text, date } = extractScheduleFromText(newTask.text, new Date());
      newTask.text = text;
      if (date) {
        newTask.date = format(date, "yyyy-MM-dd") || "";
      }
    }
    const snapshot = getGlobalStateSnapshot();
    setGlobalState({
      ...snapshot,
      tasks: {
        ...snapshot.tasks,
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
    if (newTask.text) {
      const { text, date } = extractScheduleFromText(newTask.text, new Date());
      newTask.text = text;
      if (date) {
        newTask.date = format(date, "yyyy-MM-dd") || "";
      }
    }
    const snapshot = getGlobalStateSnapshot();
    setGlobalState({
      ...snapshot,
      tasks: {
        ...snapshot.tasks,
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
    const snapshot = getGlobalStateSnapshot();
    setGlobalState({
      ...snapshot,
      tasks: {
        ...snapshot.tasks,
        [deletedTaskId]: undefined,
      },
    });
    client()
      .delete(`/api/tasks/${deletedTaskId}`)
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
