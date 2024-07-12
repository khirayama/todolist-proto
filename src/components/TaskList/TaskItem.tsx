import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Root as Checkbox,
  Indicator as CheckboxIndicator,
} from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { clsx } from "clsx";
import { useRouter } from "next/router";
import qs from "query-string";

import { useTasks } from "hooks/useTasks";
import { Icon } from "libs/components/Icon";
import { DatePickerSheet } from "components/DatePickerSheet";
import { TaskTextArea } from "components/TaskList";
import { ParamsLink } from "libs/components/ParamsLink";

function isDatePickerSheetOpened(taskId: string) {
  const query = qs.parse(window.location.search);
  return query.sheet === "datepicker" && query.taskid === taskId;
}

export function TaskItem(props: { disabled?: boolean; task: Task }) {
  const router = useRouter();
  const task = props.task;

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

        <span className="flex items-center p-1 pr-2">
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
          data-taskdatepicker={task.id}
          data-trigger={`datepicker-${task.id}`}
          tabIndex={props.disabled ? -1 : 0}
          className="flex items-center justify-center p-2 text-gray-400 cursor-pointer fill-gray-400 rounded focus:bg-gray-200"
          href="/app"
          params={{
            sheet: "datepicker",
            taskid: task.id,
            trigger: `datepicker-${task.id}`,
          }}
          mergeParams
        >
          {task.date || <Icon text="event" />}
        </ParamsLink>
      </div>

      <DatePickerSheet
        value={task.date}
        open={() => isDatePickerSheetOpened(task.id)}
        handleChange={(v) => {
          updateTask({
            ...task,
            date: v,
          });
          router.back();
        }}
        handleCancel={() => {
          router.back();
        }}
      />
    </>
  );
}
