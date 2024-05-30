import { v4 as uuid } from "uuid";
import { useState, KeyboardEvent } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
import { clsx } from "clsx";

import { useApp } from "hooks/useApp";
import { useTaskLists } from "hooks/useTaskLists";
import { Icon } from "libs/components/Icon";
import { useCustomTranslation } from "libs/i18n";

export function TaskListList(props: {
  taskLists: TaskList[];
  handleTaskListLinkClick: (taskListId: string) => void;
}) {
  const { t } = useCustomTranslation("components.TaskListList");

  const [taskListName, setTaskListName] = useState<string>("");
  const [insertPosition, setInsertPosition] = useState<"bottom" | "top">(
    "bottom"
  );
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);
  const [, { updateApp }] = useApp();
  const [, { createTaskList, deleteTaskList }] = useTaskLists();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const taskLists = props.taskLists;
  const isInsertTop =
    (insertPosition === "top" && !isShiftPressed) ||
    (insertPosition === "bottom" && isShiftPressed);

  const onTaskListFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (taskListName === "") {
      return;
    }
    const newTaskList: TaskList = {
      id: uuid(),
      name: taskListName,
      taskIds: [],
    };
    let newTaskLists = [];
    if (isInsertTop) {
      newTaskLists = [newTaskList, ...taskLists];
    } else {
      newTaskLists = [...taskLists, newTaskList];
    }
    createTaskList(newTaskList);
    updateApp({ taskListIds: newTaskLists.map((tl) => tl.id) });
    setTaskListName("");
    setTimeout(() => {
      props.handleTaskListLinkClick(newTaskList.id);
    }, 0);
  };
  const onInsertPositionIconClick = () => {
    setInsertPosition(insertPosition === "bottom" ? "top" : "bottom");
  };
  const onTaskListNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskListName(e.target.value);
  };
  const onTaskListNameKeyDownAndKeyUp = (e: KeyboardEvent) => {
    setIsShiftPressed(e.shiftKey);
  };
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (active && over && active.id !== over.id) {
      const oldIndex = taskLists.findIndex((tl) => tl.id === active.id);
      const newIndex = taskLists.findIndex((tl) => tl.id === over.id);

      const newTaskLists = arrayMove(taskLists, oldIndex, newIndex);
      updateApp({
        taskListIds: newTaskLists.map((tl) => tl.id),
      });
    }
  };

  return (
    <div>
      <header className="sticky w-full top-0 border-b z-20 bg-white">
        <section className="px-2">
          <form
            className="flex items-center py-2 bg-white"
            onSubmit={onTaskListFormSubmit}
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
              type="text"
              value={taskListName}
              placeholder={
                isInsertTop
                  ? t("Add task list to top")
                  : t("Add task list to bottom")
              }
              onChange={onTaskListNameChange}
              onKeyDown={onTaskListNameKeyDownAndKeyUp}
              onKeyUp={onTaskListNameKeyDownAndKeyUp}
            />
            <button className="p-2 flex" type="submit">
              <Icon text="send" />
            </button>
          </form>
        </section>
      </header>

      <section>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={taskLists}
            strategy={verticalListSortingStrategy}
          >
            {taskLists.map((taskList, i) => {
              const handleInsertTaskListButtonClick = (idx: number) => {
                const newTaskLists = [...taskLists];
                const newTaskList = {
                  id: uuid(),
                  name: taskListName,
                  taskIds: [],
                };
                newTaskLists.splice(idx, 0, newTaskList);
                createTaskList(newTaskList);
                updateApp({ taskListIds: newTaskLists.map((tl) => tl.id) });
                setTaskListName("");
              };
              const handleDeleteTaskListButtonClick = (taskListId: string) => {
                const newTaskLists = taskLists.filter(
                  (tl) => tl.id !== taskListId
                );
                deleteTaskList(taskListId);
                updateApp({ taskListIds: newTaskLists.map((tl) => tl.id) });
              };

              return (
                <TaskListListItem
                  key={taskList.id}
                  index={i}
                  taskList={taskList}
                  newTaskListName={taskListName}
                  handleInsertTaskListButtonClick={
                    handleInsertTaskListButtonClick
                  }
                  handleDeleteTaskListButtonClick={
                    handleDeleteTaskListButtonClick
                  }
                  handleTaskListLinkClick={props.handleTaskListLinkClick}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </section>
    </div>
  );
}

function TaskListListItem(props: {
  index: number;
  taskList: TaskList;
  newTaskListName: string;
  handleInsertTaskListButtonClick: (idx: number) => void;
  handleDeleteTaskListButtonClick: (taskListId: string) => void;
  handleTaskListLinkClick: (taskListId: string) => void;
}) {
  const taskList = props.taskList;
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({ id: taskList.id });

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
        "relative flex border-b bg-white",
        isDragging && "z-10 border-t"
      )}
    >
      {props.newTaskListName && props.index === 0 && !isSorting ? (
        <button
          className="flex items-center justify-center absolute z-10 top-0 right-12 translate-y-[-50%] bg-white rounded-full w-8 h-8 border text-gray-400"
          onClick={() => props.handleInsertTaskListButtonClick(0)}
        >
          <Icon text="add" />
        </button>
      ) : null}
      <span
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        className={clsx(
          "flex items-center justify-center py-2 pl-3 pr-2 text-gray-400",
          mustHaveClassNames
        )}
      >
        <Icon text="drag_indicator" />
      </span>
      <button
        className={clsx("flex-1 py-4 cursor-pointer text-left")}
        onClick={() => {
          props.handleTaskListLinkClick(taskList.id);
        }}
      >
        {taskList.name}
      </button>
      <button
        onClick={() => {
          let removeFlag = true;
          if (taskList.taskIds.length !== 0) {
            removeFlag = window.confirm(
              "TODO: this task list has tasks. Do you want to delete it?"
            );
          }
          if (removeFlag) {
            props.handleDeleteTaskListButtonClick(taskList.id);
          }
        }}
        className="flex items-center justify-center pl-2 pr-4 py-2 text-gray-400 cursor-pointer"
      >
        <Icon text="delete" />
      </button>
      {props.newTaskListName && !isSorting ? (
        <button
          className="flex items-center justify-center absolute z-10 bottom-0 right-12 translate-y-[50%] bg-white rounded-full w-8 h-8 border text-gray-400"
          onClick={() => props.handleInsertTaskListButtonClick(props.index + 1)}
        >
          <Icon text="add" />
        </button>
      ) : null}
    </div>
  );
}
