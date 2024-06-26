import { v4 as uuid } from "uuid";
import { useState, FormEvent, KeyboardEvent } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragCancelEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { clsx } from "clsx";
import { useRouter } from "next/router";
import qs from "query-string";

import { useApp } from "hooks/useApp";
import { useTasks } from "hooks/useTasks";
import { Icon } from "libs/components/Icon";
import { ParamsLink } from "libs/components/ParamsLink";
import { useCustomTranslation } from "libs/i18n";
import { useTaskLists } from "hooks/useTaskLists";
import { SharingSheet } from "components/SharingSheet";
import { TaskItem } from "components/TaskList";
import { kmh } from "libs/keymap";

const isSharingSheetOpened = (taskListId: string) => {
  const query = qs.parse(window.location.search);
  return query.sheet === "sharing" && query.tasklistid === taskListId;
};

export function TaskList(props: {
  disabled?: boolean;
  taskList: TaskList;
  handleDragStart?: (e: DragStartEvent) => void;
  handleDragCancel?: (e: DragCancelEvent) => void;
  handleDragEnd?: (e: DragEndEvent) => void;
}) {
  const taskList = props.taskList;

  const router = useRouter();
  const { t } = useCustomTranslation("components.TaskList");

  const [taskText, setTaskText] = useState<string>("");
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);
  const [, { createTask, updateTask, deleteTask }, { getTasksById }] =
    useTasks();
  const [{ data: app }, { updateApp }] = useApp();
  const [, { updateTaskList }] = useTaskLists();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasks = getTasksById(taskList.taskIds);
  const isInsertTop =
    (app.taskInsertPosition === "TOP" && !isShiftPressed) ||
    (app.taskInsertPosition === "BOTTOM" && isShiftPressed);

  const clearCompletedTasks = () => {
    const ts = [...tasks];
    ts.forEach((t) => {
      if (t.completed) {
        deleteTask(t.id);
      }
    });
    const newTaskList = {
      ...taskList,
      taskIds: ts.filter((t) => !t.completed).map((t) => t.id),
    };
    updateTaskList(newTaskList);
  };

  const sortTasks = () => {
    const ts = [...tasks];
    const newTaskList = {
      ...taskList,
      taskIds: ts
        .sort((a, b) => {
          if (a.completed && !b.completed) {
            return 1;
          }
          if (!a.completed && b.completed) {
            return -1;
          }
          if (!a.date && b.date) {
            return 1;
          }
          if (a.date && !b.date) {
            return -1;
          }
          if (a.date > b.date) {
            return 1;
          }
          if (a.date < b.date) {
            return -1;
          }
          return 0;
        })
        .concat()
        .map((t) => t.id),
    };
    updateTaskList(newTaskList);
  };

  const onTaskListNameChange = (e: FormEvent<HTMLInputElement>) => {
    updateTaskList({
      ...taskList,
      name: e.currentTarget.value,
    });
  };
  const onTaskFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (taskText === "") {
      return;
    }
    const newTask = {
      id: uuid(),
      text: taskText,
      completed: false,
      date: "",
    };
    if (isInsertTop) {
      createTask(newTask);
      updateTaskList({
        ...props.taskList,
        taskIds: [newTask.id, ...taskList.taskIds],
      });
    } else {
      createTask(newTask);
      updateTaskList({
        ...props.taskList,
        taskIds: [...taskList.taskIds, newTask.id],
      });
    }
    setTaskText("");
  };
  const onInsertPositionIconClick = () => {
    updateApp({
      taskInsertPosition:
        app.taskInsertPosition === "BOTTOM" ? "TOP" : "BOTTOM",
    });
  };
  const onTaskTextChange = (e: FormEvent<HTMLInputElement>) => {
    setTaskText(e.currentTarget.value);
  };
  const onTaskTextKeyDownAndKeyUp = (e: KeyboardEvent) => {
    setIsShiftPressed(e.shiftKey);
  };
  const onTaskTextBlur = () => {
    setIsShiftPressed(false);
  };
  const onSortTasksButtonClick = () => {
    sortTasks();
  };
  const onClearCompletedTasksButtonClick = () => {
    clearCompletedTasks();
  };
  const handleDragEnd = (e: DragEndEvent) => {
    if (props.handleDragEnd) {
      props.handleDragEnd(e);
    }
    const { active, over } = e;

    if (active && over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);

      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      updateTaskList({
        ...taskList,
        taskIds: newTasks.map((t) => t.id),
      });
    }
  };
  const handleTaskListKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const el: {
      taskList: HTMLDivElement;
      taskText: HTMLInputElement;
      taskItem: HTMLElement;
      taskItems: NodeListOf<HTMLElement>;
    } = {
      taskList: e.currentTarget,
      taskText: e.currentTarget.querySelector("[data-tasktext]"),
      taskItem: e.target as HTMLElement,
      taskItems: e.currentTarget.querySelectorAll(`[data-taskid]`),
    };

    let taskId = "";
    while (el.taskItem && el.taskItem !== e.currentTarget && !taskId) {
      taskId = el.taskItem.getAttribute("data-taskid");
      if (!taskId) {
        el.taskItem = el.taskItem.parentElement;
      }
    }
    const task = tasks.find((t) => t.id === taskId);
    const isSorting = el.taskItem?.getAttribute("data-sorting") === "true";
    if (isSorting) {
      return;
    }
    const isTaskItemTextFocused =
      el.taskItem?.querySelector("textarea") === e.target;

    /* Keymap
     * Escape: blur task text
     * Ctrl-o: sort tasks
     *
     * On Task Text
     * Shift-Delete: clear completed tasks
     * ArrowDown: focus first task text
     *
     * On Task Item
     * Enter: insert task below
     * Shift-Enter: insert task above
     * Mod-Enter: toggle task completed
     * Mod-Delete: delete task
     * Delete: delete task
     * Shift-Delete: delete completed tasks
     * ArrowDown: focus next task text
     * ArrowUp: focus previous task text
     * Mod-c: open datepicker
     */

    /* task text and task item event */
    kmh("Escape", e.nativeEvent, () => (e.target as HTMLElement).blur());
    kmh("Ctrl-o", e.nativeEvent, () => sortTasks());
    /* task text event */
    if (!task) {
      kmh("Shift-Delete", e.nativeEvent, () => {
        e.preventDefault();
        clearCompletedTasks();
      });
      kmh("ArrowDown", e.nativeEvent, () => {
        e.preventDefault();
        const t = el.taskItems[0]?.querySelector("textarea");
        if (t) {
          setTimeout(() => {
            t.focus();
            t.selectionStart = t.value.length;
            t.selectionEnd = t.value.length;
          }, 0);
        }
      });
    }
    /* task item event */
    if (task) {
      const handleDeleteKey = () => {
        for (let i = 0; i < el.taskItems.length; i++) {
          if (el.taskItems[i] === el.taskItem) {
            const t =
              (el.taskItems[i - 1] || el.taskItems[i + 1])?.querySelector(
                "textarea"
              ) || el.taskText;
            if (t) {
              setTimeout(() => {
                t.focus();
                t.selectionStart = t.value.length;
                t.selectionEnd = t.value.length;
              }, 0);
            }
            break;
          }
        }
        e.preventDefault();
        const ts = [...tasks];
        const newTaskList = {
          ...taskList,
          taskIds: ts.filter((t) => t.id !== task.id).map((t) => t.id),
        };
        updateTaskList(newTaskList);
      };

      kmh(
        "Enter",
        e.nativeEvent,
        () => {
          e.preventDefault();
          for (let i = 0; i < el.taskItems.length; i++) {
            if (el.taskItems[i] === el.taskItem) {
              const newTasks = [...tasks];
              const newTask = {
                id: uuid(),
                text: "",
                completed: false,
                date: "",
              };
              newTasks.splice(i + 1, 0, newTask);
              createTask(newTask);
              updateTaskList({
                ...taskList,
                taskIds: newTasks.map((t) => t.id),
              });
              setTimeout(() => {
                const t = document.querySelector<HTMLTextAreaElement>(
                  `[data-taskid="${newTask.id}"] textarea`
                );
                t.focus();
                t.selectionStart = t.value.length;
                t.selectionEnd = t.value.length;
              }, 0);
              break;
            }
          }
        },
        () => isTaskItemTextFocused
      );
      kmh(
        "Shift-Enter",
        e.nativeEvent,
        () => {
          e.preventDefault();
          for (let i = 0; i < el.taskItems.length; i++) {
            if (el.taskItems[i] === el.taskItem) {
              const newTasks = [...tasks];
              const newTask = {
                id: uuid(),
                text: "",
                completed: false,
                date: "",
              };
              newTasks.splice(i, 0, newTask);
              createTask(newTask);
              updateTaskList({
                ...taskList,
                taskIds: newTasks.map((t) => t.id),
              });
              setTimeout(() => {
                const t = document.querySelector<HTMLTextAreaElement>(
                  `[data-taskid="${newTask.id}"] textarea`
                );
                t.focus();
                t.selectionStart = t.value.length;
                t.selectionEnd = t.value.length;
              }, 0);
              break;
            }
          }
        },
        () => isTaskItemTextFocused
      );
      kmh("Mod-Enter", e.nativeEvent, () => {
        e.preventDefault();
        updateTask({
          ...task,
          completed: !task.completed,
        });
      });
      kmh("Mod-Delete", e.nativeEvent, handleDeleteKey);
      kmh("Delete", e.nativeEvent, handleDeleteKey, () => !task.text);
      kmh("Shift-Delete", e.nativeEvent, () => {
        e.preventDefault();
        if (task.completed) {
          let flag = false;
          const ts = [...tasks];
          for (let i = 0; i < el.taskItems.length; i++) {
            if (el.taskItems[i] === el.taskItem) {
              flag = true;
            }
            if (flag && !ts[i].completed) {
              const t =
                el.taskItems[i]?.querySelector("textarea") || el.taskText;
              if (t) {
                setTimeout(() => {
                  t.focus();
                  t.selectionStart = t.value.length;
                  t.selectionEnd = t.value.length;
                }, 0);
              }
              break;
            }
          }
        }
        clearCompletedTasks();
      });
      kmh("ArrowDown", e.nativeEvent, () => {
        for (let i = 0; i < el.taskItems.length - 1; i++) {
          if (el.taskItems[i] === el.taskItem) {
            e.preventDefault();
            const t = el.taskItems[i + 1]?.querySelector("textarea");
            setTimeout(() => {
              t.focus();
              t.selectionStart = t.value.length;
              t.selectionEnd = t.value.length;
            }, 0);
            break;
          }
        }
      });
      kmh("ArrowUp", e.nativeEvent, () => {
        for (let i = 0; i < el.taskItems.length; i++) {
          if (el.taskItems[i] === el.taskItem) {
            e.preventDefault();
            const t =
              i !== 0
                ? el.taskItems[i - 1]?.querySelector("textarea")
                : el.taskText;
            setTimeout(() => {
              t.focus();
              t.selectionStart = t.value.length;
              t.selectionEnd = t.value.length;
            }, 0);
            break;
          }
        }
      });
      kmh("Mod-c", e.nativeEvent, () => {
        const query = qs.parse(window.location.search);
        query.sheet = "datepicker";
        query.taskid = task.id;
        router.push("/app", { query });
      });
    }
  };

  return (
    <>
      <div className="h-full overflow-scroll" onKeyDown={handleTaskListKeyDown}>
        <header className="sticky w-full top-0 border-b z-20 bg-white">
          <section className={clsx("px-1")}>
            <div className="relative">
              <h1 className="py-2 text-center font-bold">
                <input
                  disabled={props.disabled}
                  className="inline-block text-center w-full"
                  type="text"
                  placeholder={t("Task list name")}
                  value={taskList.name}
                  onChange={onTaskListNameChange}
                />
              </h1>
              <ParamsLink
                tabIndex={props.disabled ? -1 : 0}
                className="absolute top-0 right-0 py-2 px-2"
                href="/app"
                params={{ sheet: "sharing", tasklistid: taskList.id }}
                mergeParams
              >
                <Icon text="share" />
              </ParamsLink>
            </div>
            <div className="flex items-center py-2 bg-white">
              <button
                disabled={props.disabled}
                className="p-2 flex"
                onClick={onInsertPositionIconClick}
              >
                {isInsertTop ? (
                  <Icon text="vertical_align_top" />
                ) : (
                  <Icon text="vertical_align_bottom" />
                )}
              </button>
              <form
                className="flex flex-1 items-center py-2 bg-white"
                onSubmit={onTaskFormSubmit}
              >
                <input
                  data-tasktext
                  disabled={props.disabled}
                  className="flex-1 rounded-full py-2 px-4 border"
                  value={taskText}
                  placeholder={
                    isInsertTop ? t("Add task to top") : t("Add task to bottom")
                  }
                  onChange={onTaskTextChange}
                  onKeyDown={onTaskTextKeyDownAndKeyUp}
                  onKeyUp={onTaskTextKeyDownAndKeyUp}
                  onBlur={onTaskTextBlur}
                />
                <button
                  disabled={props.disabled}
                  className="p-2 flex"
                  type="submit"
                >
                  <Icon text="send" />
                </button>
              </form>
            </div>
          </section>
          <section className="flex py-2 pl-4 pr-3 text-gray-400">
            <button
              disabled={props.disabled}
              className="flex"
              onClick={onSortTasksButtonClick}
            >
              <Icon text="sort" />
              <span className="pl-1">{t("Sort")}</span>
            </button>
            <div className="inline-block flex-1"></div>
            <button
              disabled={props.disabled}
              className="flex"
              onClick={onClearCompletedTasksButtonClick}
            >
              <span className="pr-1">{t("Clear Completed")}</span>
              <Icon text="delete" />
            </button>
          </section>
        </header>

        <section>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={props.handleDragStart}
            onDragCancel={props.handleDragCancel}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((task, i) => {
                const handleInsertTaskButtonClick = (idx: number) => {
                  const newTasks = [...tasks];
                  const newTask = {
                    id: uuid(),
                    text: taskText,
                    completed: false,
                    date: "",
                  };
                  newTasks.splice(idx, 0, newTask);
                  createTask(newTask);
                  updateTaskList({
                    ...taskList,
                    taskIds: newTasks.map((t) => t.id),
                  });
                  setTaskText("");
                };

                return (
                  <TaskItem
                    key={task.id}
                    disabled={props.disabled}
                    index={i}
                    task={task}
                    newTaskText={taskText}
                    handleInsertTaskButtonClick={handleInsertTaskButtonClick}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </section>
      </div>

      <SharingSheet
        open={() => isSharingSheetOpened(taskList.id)}
        taskList={taskList}
      />
    </>
  );
}
