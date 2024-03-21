import { v4 as uuid } from "uuid";
import { useState } from "react";
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

import { Icon } from "components/Icon";

export function TaskListList(props: {
  taskLists: TaskList[];
  handleTaskListChange: (updatedTaskList: TaskList) => void;
  handleTaskListsChange: (updateTaskLists: TaskList[]) => void;
  handleTaskListLinkClick: (taskListId: string) => void;
}) {
  const [taskListName, setTaskListName] = useState<string>("");
  const [insertPosition, setInsertPosition] = useState<"bottom" | "top">(
    "bottom"
  );
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);

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

  return (
    <div>
      <header className="sticky w-full top-0 border-b z-20 bg-white">
        <section className="px-2">
          <form
            className="flex items-center py-2 bg-white"
            onSubmit={(e) => {
              e.preventDefault();
              if (taskListName === "") {
                return;
              }
              const newTaskList: TaskList = {
                id: uuid(),
                name: taskListName,
                tasks: [],
              };
              if (isInsertTop) {
                props.handleTaskListsChange([newTaskList, ...taskLists]);
              } else {
                props.handleTaskListsChange([...taskLists, newTaskList]);
              }
              setTaskListName("");
              setTimeout(() => {
                props.handleTaskListLinkClick(newTaskList.id);
              }, 0);
            }}
          >
            <span
              className="p-2 flex"
              onClick={() => {
                setInsertPosition(
                  insertPosition === "bottom" ? "top" : "bottom"
                );
              }}
            >
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
                isInsertTop ? "Add task list to top" : "Add task list to bottom"
              }
              onChange={(e) => {
                setTaskListName(e.target.value);
              }}
              onKeyDown={(e) => setIsShiftPressed(e.shiftKey)}
              onKeyUp={(e) => setIsShiftPressed(e.shiftKey)}
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
          onDragEnd={(event: DragEndEvent) => {
            const { active, over } = event;

            if (active && over && active.id !== over.id) {
              const oldIndex = taskLists.findIndex((tl) => tl.id === active.id);
              const newIndex = taskLists.findIndex((tl) => tl.id === over.id);

              const newTaskLists = arrayMove(taskLists, oldIndex, newIndex);
              props.handleTaskListsChange(newTaskLists);
            }
          }}
        >
          <SortableContext
            items={taskLists}
            strategy={verticalListSortingStrategy}
          >
            {taskLists.map((taskList, i) => (
              <TaskListListItem
                key={taskList.id}
                index={i}
                taskList={taskList}
                newTaskListName={taskListName}
                handleTaskListChange={(newTaskList) => {
                  props.handleTaskListChange(newTaskList);
                }}
                handleInsertTaskListButtonClick={(idx) => {
                  const newTaskLists = [...taskLists];
                  newTaskLists.splice(idx, 0, {
                    id: uuid(),
                    name: taskListName,
                    tasks: [],
                  });
                  props.handleTaskListsChange(newTaskLists);
                  setTaskListName("");
                }}
                handleDeleteTaskListButtonClick={(taskListId) => {
                  props.handleTaskListsChange(
                    taskLists.filter((tl) => tl.id !== taskListId)
                  );
                }}
                handleTaskListLinkClick={(taskListId) => {
                  props.handleTaskListLinkClick(taskListId);
                }}
              />
            ))}
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
  handleTaskListChange: (taskList: TaskList) => void;
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
      <span
        className={clsx("flex-1 py-4")}
        onClick={() => {
          props.handleTaskListLinkClick(taskList.id);
        }}
      >
        {taskList.name}
      </span>
      <span
        onClick={() => {
          props.handleDeleteTaskListButtonClick(taskList.id);
        }}
        className="flex items-center justify-center pl-2 pr-4 py-2 text-gray-400 cursor-pointer"
      >
        <Icon text="delete" />
      </span>
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
