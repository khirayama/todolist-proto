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
import { useTranslation } from "react-i18next";

import { Icon } from "libs/components/Icon";
import { TaskItem } from "components/TaskItem";

export function TaskList(props: {
  hasPrev: boolean;
  hasNext: boolean;
  taskList: TaskList;
  insertPosition: Preferences["taskInsertPosition"];
  handlePreferencesChange: (updatedPreferences: Partial<Preferences>) => void;
  handleTaskChange: (updatedTask: Task) => void;
  handleTaskListChange: (updateTaskList: TaskList) => void;
  handleDragStart: (e: DragStartEvent) => void;
  handleDragCancel: (e: DragCancelEvent) => void;
  handleDragEnd: (e: DragEndEvent) => void;
}) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`components.TaskList.${key}`);

  const [taskText, setTaskText] = useState<string>("");
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const insertPosition = props.insertPosition;
  const taskList = props.taskList;
  const tasks = taskList.tasks;
  const isInsertTop =
    (insertPosition === "top" && !isShiftPressed) ||
    (insertPosition === "bottom" && isShiftPressed);

  const clearCompletedTasks = (tl: TaskList) => {
    const newTaskList = {
      ...tl,
      tasks: tl.tasks.filter((t) => !t.complete),
    };
    return newTaskList;
  };
  const sortTasks = (tl: TaskList) => {
    const newTaskList = {
      ...tl,
      tasks: tl.tasks
        .sort((a, b) => {
          if (a.complete && !b.complete) {
            return 1;
          }
          if (!a.complete && b.complete) {
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
        .concat(),
    };
    return newTaskList;
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
    props.handleTaskListChange({
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
      complete: false,
      date: "",
    };
    if (isInsertTop) {
      props.handleTaskListChange({
        ...props.taskList,
        tasks: [newTask, ...tasks],
      });
    } else {
      props.handleTaskListChange({
        ...props.taskList,
        tasks: [...tasks, newTask],
      });
    }
    setTaskText("");
  };
  const onInsertPositionIconClick = () => {
    props.handlePreferencesChange({
      taskInsertPosition: insertPosition === "bottom" ? "top" : "bottom",
    });
  };
  const onTaskTextChange = (e: FormEvent<HTMLInputElement>) => {
    setTaskText(e.currentTarget.value);
  };
  const onTaskTextKeyDownAndKeyUp = (e: KeyboardEvent) => {
    setIsShiftPressed(e.shiftKey);
  };
  const onSortTasksButtonClick = () => {
    props.handleTaskListChange(sortTasks(taskList));
  };
  const onClearCompletedTasksButtonClick = () => {
    props.handleTaskListChange(clearCompletedTasks(taskList));
  };
  const handleDragEnd = (e: DragEndEvent) => {
    props.handleDragEnd(e);
    const { active, over } = e;

    if (active && over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);

      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      props.handleTaskListChange({
        ...taskList,
        tasks: newTasks,
      });
    }
  };
  const handleTaskListItemKeyDown = (e: KeyboardEvent, task: Task) => {
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

    if (key === "Enter" && !shift && !ctrl && !meta) {
      e.preventDefault();
      for (let i = 0; i < taskEls.length; i++) {
        if (taskEls[i] === el) {
          const newTasks = [...taskList.tasks];
          const newTask = {
            id: uuid(),
            text: taskText,
            complete: false,
            date: "",
          };
          newTasks.splice(i + 1, 0, newTask);
          props.handleTaskListChange({
            ...taskList,
            tasks: newTasks,
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
          const newTasks = [...taskList.tasks];
          const newTask = {
            id: uuid(),
            text: taskText,
            complete: false,
            date: "",
          };
          newTasks.splice(i, 0, newTask);
          props.handleTaskListChange({
            ...taskList,
            tasks: newTasks,
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
      console.log("TODO: Insert new task prev");
    }
    if (key === "Enter" && !shift && (ctrl || meta)) {
      e.preventDefault();
      props.handleTaskChange({
        ...task,
        complete: !task.complete,
      });
    }
    if ((key === "Backspace" || key === "Delete") && !shift && (ctrl || meta)) {
      for (let i = 0; i < taskEls.length; i++) {
        if (taskEls[i] === el) {
          e.preventDefault();
          const t =
            (taskEls[i + 1] || taskEls[i - 1])?.querySelector("textarea") ||
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
      const newTaskList = {
        ...taskList,
        tasks: taskList.tasks.filter((t) => t.id !== task.id),
      };
      props.handleTaskListChange(newTaskList);
    }
    if ((key === "Backspace" || key === "Delete") && shift && !ctrl && !meta) {
      e.preventDefault();
      props.handleTaskListChange(clearCompletedTasks(taskList));
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
      const dateInputEl =
        el.querySelector<HTMLInputElement>("input[type='date']");
      dateInputEl?.focus();
      dateInputEl?.showPicker();
      console.log("TODO: Focus to text area when closing picker");
    }
    if (key === "o" && !shift && ctrl && !meta) {
      props.handleTaskListChange(sortTasks(taskList));
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
                  placeholder={tr("Task list name")}
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
              <span className="p-2 flex" onClick={onInsertPositionIconClick}>
                {isInsertTop ? (
                  <Icon text="vertical_align_top" />
                ) : (
                  <Icon text="vertical_align_bottom" />
                )}
              </span>
              <input
                data-tasktext
                className="flex-1 rounded-full py-2 px-4 border"
                value={taskText}
                placeholder={
                  isInsertTop ? tr("Add task to top") : tr("Add task to bottom")
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
              <span className="pl-1">{tr("Sort")}</span>
            </button>
            <div className="inline-block flex-1"></div>
            <button className="flex" onClick={onClearCompletedTasksButtonClick}>
              <span className="pr-1">{tr("Clear Completed")}</span>
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
                  const newTasks = [...taskList.tasks];
                  newTasks.splice(idx, 0, {
                    id: uuid(),
                    text: taskText,
                    complete: false,
                    date: "",
                  });
                  props.handleTaskListChange({
                    ...taskList,
                    tasks: newTasks,
                  });
                  setTaskText("");
                };

                return (
                  <TaskItem
                    key={task.id}
                    index={i}
                    task={task}
                    newTaskText={taskText}
                    handleTaskChange={props.handleTaskChange}
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
