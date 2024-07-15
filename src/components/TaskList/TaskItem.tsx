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
    <>
      <div
        data-taskid={task.id}
        data-sorting={isSorting}
        ref={setNodeRef}
        style={style}
        className={clsx(
          "relative flex",
          isDragging && "z-10 shadow",
          task.completed ? "opacity-55" : "bg-white"
        )}
      >
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className={clsx(
            "flex items-center justify-center p-2 px-1 text-gray-400 touch-none fill-gray-400 rounded focus:bg-gray-200"
          )}
        >
          <Icon text="drag_indicator" />
        </button>

        <span className="flex items-center p-1">
          <Checkbox
            disabled={props.disabled}
            className="group border flex w-6 h-6 justify-center items-center rounded-full overflow-hidden focus:bg-gray-200"
            checked={task.completed}
            onCheckedChange={(v: boolean) => {
              updateTask({
                ...task,
                completed: v,
              });
            }}
          >
            <CheckboxIndicator className="bg-gray-100 text-gray-400 w-full h-full justify-center items-center flex group-focus:bg-gray-200">
              <CheckIcon />
            </CheckboxIndicator>
          </Checkbox>
        </span>

        <TaskTextArea
          disabled={props.disabled}
          task={task}
          // onFocus, onBlurで、focus状態か保存して、DatePickerから戻ってきた時に維持するか考える
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
          className="flex items-center justify-center text-gray-400 cursor-pointer fill-gray-400 rounded focus:bg-gray-200 px-1"
          href="/app"
          params={{
            sheet: "datepicker",
            taskid: task.id,
            trigger: `datepicker-${task.id}`,
          }}
          mergeParams
        >
          {task.date ? (
            <div className="inline text-right px-1">
              <div className="font-bold leading-none w-full">
                {format(task.date, "MM/dd")}
              </div>
              <div className="text-xs leading-none w-full">
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
    </>
  );
}
