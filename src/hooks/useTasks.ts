import { useEffect } from "react";

import { useGlobalState } from "libs/globalState";
import { useSupabase } from "libs/supabase";
import { createDebounce } from "libs/common";
import { client } from "hooks/common";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList, Task

const updateDebounce = createDebounce();

export const useTasks = (
  params: { taskListIds?: string[] } = {}
): [
  { [id: string]: Task },
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
      });
  };

  useEffect(() => {
    if (isLoggedIn || params.taskListIds) {
      fetchTasks();
    }
  }, [isLoggedIn]);

  const createTask = (newTask: Task) => {
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
    }, 400);
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
    globalState.tasks,
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
