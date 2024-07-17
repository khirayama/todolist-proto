import { diff, patch } from "jsondiffpatch";
import { format } from "date-fns";

import { useGlobalState } from "libs/globalState";
import { createDebounce } from "libs/common";
import { useClient } from "hooks/common";
import { extractScheduleFromText } from "libs/extractScheduleFromText";

// useResouce: () => [Resouce, { mutations }, { selectors }]
// App, Profile, Preferences, TaskList, Task

const updateDebounce = createDebounce();

export const useTasks = (
  url: string,
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
  const { sent, polling, isInitialized, isLoading } = useClient(url, {
    before: () => {
      return { cache: getGlobalStateSnapshot().tasks };
    },
    resolve: (res, { cache }) => {
      const snapshot = getGlobalStateSnapshot();
      const delta = diff(cache, snapshot.tasks);
      const newTasks = res.data.tasks.reduce(
        (acc: {}, t: Task) => ({ ...acc, [t.id]: t }),
        {},
      );
      setGlobalState({
        tasks: patch(newTasks, delta) as { [id: string]: Task },
      });
    },
  });

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
    sent({
      method: "POST",
      url: "/api/tasks",
      data: newTask,
    }).catch((err) => {
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
      sent({
        method: "PATCH",
        url: `/api/tasks/${newTask.id}`,
        data: newTask,
      }).catch((err) => {
        console.log(err);
      });
    }, 600);
  };

  const deleteTask = (deletedTaskId: string) => {
    polling.restart();

    setGlobalState({
      tasks: {
        [deletedTaskId]: undefined,
      },
    });
    sent({
      method: "DELETE",
      url: `/api/tasks/${deletedTaskId}`,
    }).catch((err) => {
      console.log(err);
    });
  };

  return [
    {
      data: globalState.tasks,
      isInitialized,
      isLoading,
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
