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

import { useApp } from "hooks/useApp";
import { useTasks } from "hooks/useTasks";
import { Icon } from "libs/components/Icon";
import { TaskItem } from "components/TaskItem";
import { useCustomTranslation } from "libs/i18n";
import { useTaskLists } from "hooks/useTaskLists";

export function TaskList(props: {
  hasPrev: boolean;
  hasNext: boolean;
  taskList: TaskList;
  handleDragStart: (e: DragStartEvent) => void;
  handleDragCancel: (e: DragCancelEvent) => void;
  handleDragEnd: (e: DragEndEvent) => void;
}) {
  const { t } = useCustomTranslation("components.TaskList");

  const [taskText, setTaskText] = useState<string>("");
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);
  const [, { createTask, updateTask, deleteTask }, { getTasksById }] =
    useTasks();
  const [app, { updateApp }] = useApp();
  const [, { updateTaskList }] = useTaskLists();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const insertPosition = app.taskInsertPosition;
  const taskList = props.taskList;
  const tasks = getTasksById(taskList.taskIds);
  const isInsertTop =
    (insertPosition === "TOP" && !isShiftPressed) ||
    (insertPosition === "BOTTOM" && isShiftPressed);

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

  const onPrevTaskListClick = () => {
    const el = document.querySelector<HTMLElement>(
      `[data-tasklistid="${taskList.id}"]`
    );
    el.parentElement.scrollTo({
      behavior: "smooth",
      left: el.parentElement.scrollLeft - el.offsetWidth,
    });
  };
  const onNextTaskListClick = () => {
    const el = document.querySelector<HTMLElement>(
      `[data-tasklistid="${taskList.id}"]`
    );
    el.parentElement.scrollTo({
      behavior: "smooth",
      left: el.parentElement.scrollLeft + el.offsetWidth,
    });
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
      taskInsertPosition: insertPosition === "BOTTOM" ? "TOP" : "BOTTOM",
    });
  };
  const onTaskTextChange = (e: FormEvent<HTMLInputElement>) => {
    setTaskText(e.currentTarget.value);
  };
  const onTaskTextKeyDownAndKeyUp = (e: KeyboardEvent) => {
    setIsShiftPressed(e.shiftKey);
  };
  const onSortTasksButtonClick = () => {
    sortTasks();
  };
  const onClearCompletedTasksButtonClick = () => {
    clearCompletedTasks();
  };
  const handleDragEnd = (e: DragEndEvent) => {
    props.handleDragEnd(e);
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
    e: KeyboardEvent,
    { task, setDatePickerSheetOpen, setHasFocusWhenOpeningDatePickerSheet }
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
      setDatePickerSheetOpen(true);
      setHasFocusWhenOpeningDatePickerSheet(true);
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
              {props.hasPrev && (
                <button
                  className="absolute top-0 left-0 py-2 text-gray-400"
                  onClick={onPrevTaskListClick}
                >
                  <Icon text="navigate_before" />
                </button>
              )}
              <h1 className="py-2 text-center font-bold">
                <input
                  className="inline-block text-center w-full"
                  type="text"
                  placeholder={t("Task list name")}
                  value={taskList.name}
                  onChange={onTaskListNameChange}
                />
              </h1>
              {props.hasNext && (
                <button
                  className="absolute top-0 right-0 py-2 text-gray-400"
                  onClick={onNextTaskListClick}
                >
                  <Icon text="navigate_next" />
                </button>
              )}
            </div>
            <form
              className="flex items-center py-2 bg-white"
              onSubmit={onTaskFormSubmit}
            >
              <button className="p-2 flex" onClick={onInsertPositionIconClick}>
                {isInsertTop ? (
                  <Icon text="vertical_align_top" />
                ) : (
                  <Icon text="vertical_align_bottom" />
                )}
              </button>
              <input
                data-tasktext
                className="flex-1 rounded-full py-2 px-4 border"
                value={taskText}
                placeholder={
                  isInsertTop ? t("Add task to top") : t("Add task to bottom")
                }
                onChange={onTaskTextChange}
                onKeyDown={onTaskTextKeyDownAndKeyUp}
                onKeyUp={onTaskTextKeyDownAndKeyUp}
              />
              <button className="p-2 flex" type="submit">
                <Icon text="send" />
              </button>
            </form>
          </section>
          <section className="flex py-2 pl-4 pr-3 text-gray-400">
            <button className="flex" onClick={onSortTasksButtonClick}>
              <Icon text="sort" />
              <span className="pl-1">{t("Sort")}</span>
            </button>
            <div className="inline-block flex-1"></div>
            <button className="flex" onClick={onClearCompletedTasksButtonClick}>
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
    </>
  );
}
