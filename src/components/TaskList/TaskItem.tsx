import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Root as Checkbox,
  Indicator as CheckboxIndicator,
} from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { clsx } from "clsx";
import { format } from "date-fns";

import { useTasks } from "hooks/useTasks";
import { Icon } from "libs/components/Icon";
import { TaskTextArea } from "components/TaskList";
import { ParamsLink } from "libs/components/ParamsLink";
import { useCustomTranslation } from "libs/i18n";

export function TaskItem(props: { disabled?: boolean; task: Task }) {
  const task = props.task;

  const { t } = useCustomTranslation("components.TaskItem");
  const [, { updateTask }] = useTasks("/api/tasks");
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

  attributes["tabIndex"] = props.disabled ? -1 : 0;
  attributes["aria-disabled"] = props.disabled;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "",
  };

  return (
    <div
      data-taskid={task.id}
      data-sorting={isSorting}
      ref={setNodeRef}
      style={style}
      className={clsx(
        "relative flex border-b",
        isDragging && "z-10 shadow",
        task.completed ? "opacity-55" : "bg-white"
      )}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={clsx(
          "flex touch-none items-center justify-center rounded fill-gray-400 p-2 px-1 text-gray-400 focus-visible:bg-gray-200"
        )}
      >
        <Icon text="drag_indicator" />
      </button>

      <span className="flex items-center p-1">
        <Checkbox
          disabled={props.disabled}
          className="group flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border focus-visible:bg-gray-200"
          checked={task.completed}
          onCheckedChange={(v: boolean) => {
            updateTask({
              ...task,
              completed: v,
            });
          }}
        >
          <CheckboxIndicator className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 group-focus-visible:bg-gray-200">
            <CheckIcon />
          </CheckboxIndicator>
        </Checkbox>
      </span>

      <TaskTextArea
        disabled={props.disabled}
        task={task}
        onTaskTextChange={(e) => {
          updateTask({
            ...task,
            text: e.currentTarget.value,
          });
        }}
      />

      <ParamsLink
        data-trigger={`datepicker-${task.id}`}
        tabIndex={props.disabled ? -1 : 0}
        className="flex cursor-pointer items-center justify-center rounded fill-gray-400 px-1 text-gray-400 focus-visible:bg-gray-200"
        href="/app"
        params={{
          sheet: "datepicker",
          taskid: task.id,
          trigger: `datepicker-${task.id}`,
        }}
        mergeParams
        onKeyDown={(e) => {
          const key = e.key;
          if (key === "Backspace" || key === "Delete") {
            e.preventDefault();
            updateTask({
              ...task,
              date: undefined,
            });
          }
        }}
      >
        {task.date ? (
          <div className="inline px-1 text-right">
            <div className="w-full font-bold leading-none">
              {format(task.date, "MM/dd")}
            </div>
            <div className="w-full text-xs leading-none">
              {t(format(task.date, "EEE"))}
            </div>
          </div>
        ) : (
          <span className="p-1">
            <Icon text="event" />
          </span>
        )}
      </ParamsLink>
    </div>
  );
}
