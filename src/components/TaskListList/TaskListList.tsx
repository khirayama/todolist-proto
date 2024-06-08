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
import { Icon } from "libs/components/Icon";
import { useCustomTranslation } from "libs/i18n";
import { TaskListListItem } from "components/TaskListList";

export function TaskListList(props: {
  disabled?: boolean;
  taskLists: TaskList[];
  handleTaskListLinkClick: (taskListId: string) => void;
}) {
  const { t } = useCustomTranslation("components.TaskListList");

  const [taskListName, setTaskListName] = useState<string>("");
  const [, { updateApp }] = useApp();
  const [, { createTaskList, deleteTaskList }] = useTaskLists();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
      <header className="sticky w-full top-0 border-b z-20 bg-white">
        <section className="px-2">
          <form
            className="flex items-center py-2 bg-white"
            onSubmit={onTaskListFormSubmit}
          >
            <input
              disabled={props.disabled}
              className="flex-1 rounded-full py-2 px-4 border"
              type="text"
              value={taskListName}
              placeholder={t("Add task list to bottom")}
              onChange={onTaskListNameChange}
            />
            <button
              disabled={props.disabled}
              className="p-2 flex"
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
            {taskLists.map((taskList, i) => {
              const handleInsertTaskListButtonClick = (idx: number) => {
                const newTaskLists = [...taskLists];
                const newTaskList = {
                  id: uuid(),
                  name: taskListName,
                  taskIds: [],
                  shareCode: "",
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
                  disabled={props.disabled}
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
