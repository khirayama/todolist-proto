import { v4 as uuid } from "uuid";
import { useState, useRef, FormEvent, KeyboardEvent } from "react";
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
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  Root as Checkbox,
  Indicator as CheckboxIndicator,
} from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";

import { Icon } from "components/Icon";

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
    const newTaskList = {
      ...taskList,
      tasks: taskList.tasks
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
    props.handleTaskListChange(newTaskList);
  };
  const onClearCompletedTasksButtonClick = () => {
    const newTaskList = {
      ...taskList,
      tasks: taskList.tasks.filter((t) => !t.complete),
    };
    props.handleTaskListChange(newTaskList);
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

function TaskTextArea(props: {
  task: Task;
  onTaskTextChange: (event: FormEvent<HTMLTextAreaElement>) => void;
}) {
  const task = props.task;

  /* FYI: Autoresize textarea */
  return (
    <div
      className={clsx(
        "relative flex-1 py-4",
        task.complete ? "line-through text-gray-400" : ""
      )}
    >
      <div className="whitespace-break-spaces invisible">
        {task.text + "\u200b"}
      </div>
      <textarea
        className={clsx(
          "absolute inline-block top-0 left-0 w-full h-full flex-1 py-4 whitespace-break-spaces",
          task.complete ? "line-through text-gray-400" : ""
        )}
        value={task.text}
        onChange={props.onTaskTextChange}
      />
    </div>
  );
}

function TaskItem(props: {
  index: number;
  task: Task;
  newTaskText: string;
  handleTaskChange: (task: Task) => void;
  handleInsertTaskButtonClick: (idx: number) => void;
}) {
  const task = props.task;
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({ id: task.id });
  const dateInputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const mustHaveClassNames = ["touch-none"];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "relative flex border-b",
        isDragging && "z-10 border-t",
        task.complete ? "bg-gray-100" : "bg-white"
      )}
    >
      {props.newTaskText && props.index === 0 && !isSorting ? (
        <button
          className="flex items-center justify-center absolute z-10 top-0 right-12 translate-y-[-50%] bg-white rounded-full w-8 h-8 border text-gray-400"
          onClick={() => props.handleInsertTaskButtonClick(0)}
        >
          <Icon text="add" />
        </button>
      ) : null}
      <span
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={clsx(
          "flex items-center justify-center py-2 pl-3 pr-2 text-gray-400",
          mustHaveClassNames
        )}
      >
        <Icon text="drag_indicator" />
      </span>
      <span className="flex items-center pr-4 py-2">
        <Checkbox
          className="border flex w-6 h-6 justify-center items-center rounded-full overflow-hidden"
          checked={task.complete}
          onCheckedChange={(v: boolean) => {
            props.handleTaskChange({
              ...task,
              complete: v,
            });
          }}
        >
          <CheckboxIndicator className="bg-gray-100 text-gray-400 w-full h-full justify-center items-center flex">
            <CheckIcon />
          </CheckboxIndicator>
        </Checkbox>
      </span>
      <TaskTextArea
        task={task}
        onTaskTextChange={(e) => {
          props.handleTaskChange({
            ...task,
            text: e.currentTarget.value,
          });
        }}
      />
      <label
        className="flex items-center justify-center pl-2 pr-4 py-2 text-gray-400 cursor-pointer"
        onClick={() => {
          dateInputRef.current?.focus();
          dateInputRef.current?.showPicker();
        }}
      >
        <input
          ref={dateInputRef}
          className="w-0"
          type="date"
          value={task.date}
          onInput={(e) => {
            /* FYI: On iOS, default RESET value is the day. For to be empty, set defaultValue blank. And it only works in onInput instead of onChange */
            e.currentTarget.defaultValue = "";
            props.handleTaskChange({
              ...task,
              date: e.currentTarget.value,
            });
          }}
        />
        {task.date || <Icon text="event" />}
      </label>
      {props.newTaskText && !isSorting ? (
        <button
          className="flex items-center justify-center absolute z-10 bottom-0 right-12 translate-y-[50%] bg-white rounded-full w-8 h-8 border text-gray-400"
          onClick={() => props.handleInsertTaskButtonClick(props.index + 1)}
        >
          <Icon text="add" />
        </button>
      ) : null}
    </div>
  );
}
