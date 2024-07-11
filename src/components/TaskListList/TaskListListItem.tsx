import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";

import { Icon } from "libs/components/Icon";

export function TaskListListItem(props: {
  disabled?: boolean;
  taskList: TaskList;
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
  } = useSortable({ id: taskList.id });

  if (props.disabled) {
    attributes["tabIndex"] = -1;
    attributes["aria-disabled"] = true;
  } else {
    attributes["tabIndex"] = 0;
    attributes["aria-disabled"] = false;
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const mustHaveClassNames = ["touch-none"];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx("relative flex bg-white", isDragging && "z-10")}
    >
      <span
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        className={clsx(
          "flex items-center justify-center py-2 pl-3 pr-2 text-gray-400 fill-gray-400",
          mustHaveClassNames
        )}
      >
        <Icon text="drag_indicator" />
      </span>
      <button
        disabled={props.disabled}
        className={clsx("flex-1 py-4 cursor-pointer text-left")}
        onClick={() => {
          props.handleTaskListLinkClick(taskList.id);
        }}
      >
        {taskList.name}
      </button>
      <button
        disabled={props.disabled}
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
        className="flex items-center justify-center pl-2 pr-4 py-2 text-gray-400 cursor-pointer fill-gray-400"
      >
        <Icon text="delete" />
      </button>
    </div>
  );
}
