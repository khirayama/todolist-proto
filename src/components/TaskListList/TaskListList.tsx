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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { useApp } from "hooks/useApp";
import { useTaskLists } from "hooks/useTaskLists";
import { Icon } from "components/Icon";
import { useCustomTranslation } from "libs/i18n";
import { TaskListListItem } from "components/TaskListList";

export function TaskListList(props: {
  disabled?: boolean;
  taskLists: TaskList[];
  handleTaskListLinkClick: (taskListId: string) => void;
}) {
  const { t } = useCustomTranslation("components.TaskListList");

  const [taskListName, setTaskListName] = useState<string>("");
  const [, { updateApp }] = useApp("/api/app");
  const [, { createTaskList, deleteTaskList }] =
    useTaskLists("/api/task-lists");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const taskLists = props.taskLists;

  const onTaskListFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (taskListName === "") {
      return;
    }
    const newTaskList: TaskList = {
      id: uuid(),
      name: taskListName,
      taskIds: [],
      shareCode: "",
    };
    const newTaskLists = [...taskLists, newTaskList];
    createTaskList(newTaskList);
    updateApp({ taskListIds: newTaskLists.map((tl) => tl.id) });
    setTaskListName("");
    setTimeout(() => {
      props.handleTaskListLinkClick(newTaskList.id);
    }, 0);
  };
  const onTaskListNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskListName(e.target.value);
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
      <header className="sticky top-0 z-20 w-full">
        <section className="px-1">
          <form
            className="flex items-center py-2"
            onSubmit={onTaskListFormSubmit}
          >
            <div className="flex-1 pl-2">
              <input
                disabled={props.disabled}
                className="w-full rounded-full border px-4 py-2 focus-visible:bg-gray-200 dark:focus-visible:bg-gray-800"
                type="text"
                value={taskListName}
                placeholder={t("Add task list to bottom")}
                onChange={onTaskListNameChange}
              />
            </div>
            <button
              disabled={props.disabled}
              className="flex rounded p-2 focus-visible:bg-gray-200 dark:fill-white dark:focus-visible:bg-gray-700"
              type="submit"
            >
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
            {taskLists.map((taskList) => {
              const handleDeleteTaskListButtonClick = (taskListId: string) => {
                const newTaskLists = taskLists.filter(
                  (tl) => tl.id !== taskListId,
                );
                deleteTaskList(taskListId);
                updateApp({ taskListIds: newTaskLists.map((tl) => tl.id) });
              };

              return (
                <TaskListListItem
                  key={taskList.id}
                  disabled={props.disabled}
                  taskList={taskList}
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
