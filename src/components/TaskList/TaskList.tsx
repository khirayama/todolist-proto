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
  const [, { createTask, updateTask, deleteTask }, { getTasksById }] = useTasks(
    { taskListIds: [props.taskList.id] }
  );
  const [app, { updateApp }] = useApp();
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
  const handleTaskListItemKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    { task }
  ) => {
    const key = e.key;
    const shift = e.shiftKey;
    const ctrl = e.ctrlKey;
    const meta = e.metaKey;
    const el = document.querySelector<HTMLElement>(
      `[data-taskid="${task.id}"]`
    );
    const taskTextEl =
      document.querySelector<HTMLInputElement>("[data-tasktext]");
    const taskEls = document.querySelectorAll<HTMLElement>(
      `[data-tasklistid="${taskList.id}"] [data-taskid]`
    );

    if (key === "Escape" && !shift && !ctrl && !meta) {
      e.currentTarget.blur();
    }
    if (key === "Enter" && !shift && !ctrl && !meta) {
      e.preventDefault();
      for (let i = 0; i < taskEls.length; i++) {
        if (taskEls[i] === el) {
          const newTasks = [...tasks];
          const newTask = {
            id: uuid(),
            text: taskText,
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
    }
    if (key === "Enter" && shift && !ctrl && !meta) {
      e.preventDefault();
      for (let i = 0; i < taskEls.length; i++) {
        if (taskEls[i] === el) {
          const newTasks = [...tasks];
          const newTask = {
            id: uuid(),
            text: taskText,
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
    }
    if (key === "Enter" && !shift && (ctrl || meta)) {
      e.preventDefault();
      updateTask({
        ...task,
        completed: !task.completed,
      });
    }
    if (
      ((key === "Backspace" || key === "Delete") && !shift && (ctrl || meta)) ||
      ((key === "Backspace" || key === "Delete") &&
        !shift &&
        !ctrl &&
        !meta &&
        task.text === "")
    ) {
      for (let i = 0; i < taskEls.length; i++) {
        if (taskEls[i] === el) {
          const t =
            (taskEls[i - 1] || taskEls[i + 1])?.querySelector("textarea") ||
            taskTextEl;
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
    }
    if ((key === "Backspace" || key === "Delete") && shift && !ctrl && !meta) {
      e.preventDefault();
      if (task.completed) {
        let flag = false;
        const ts = [...tasks];
        for (let i = 0; i < taskEls.length; i++) {
          if (taskEls[i] === el) {
            flag = true;
          }
          if (flag && !ts[i].completed) {
            const t = taskEls[i]?.querySelector("textarea") || taskTextEl;
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
    }
    if (key === "ArrowDown" && !shift && !ctrl && !meta) {
      for (let i = 0; i < taskEls.length - 1; i++) {
        if (taskEls[i] === el) {
          e.preventDefault();
          const t = taskEls[i + 1]?.querySelector("textarea");
          setTimeout(() => {
            t.focus();
            t.selectionStart = t.value.length;
            t.selectionEnd = t.value.length;
          }, 0);
          break;
        }
      }
    }
    if (key === "ArrowUp" && !shift && !ctrl && !meta) {
      for (let i = 1; i < taskEls.length; i++) {
        if (taskEls[i] === el) {
          e.preventDefault();
          const t = taskEls[i - 1]?.querySelector("textarea");
          setTimeout(() => {
            t.focus();
            t.selectionStart = t.value.length;
            t.selectionEnd = t.value.length;
          }, 0);
          break;
        }
      }
    }
    if (key === "c" && !shift && (ctrl || meta)) {
      const query = qs.parse(window.location.search);
      query.sheet = "datepicker";
      query.taskid = task.id;
      router.push("/app", { query });
    }
    if (key === "o" && !shift && ctrl && !meta) {
      sortTasks();
    }
  };

  return (
    <>
      <div className="h-full overflow-scroll">
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
                    handleTaskListItemKeyDown={handleTaskListItemKeyDown}
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
