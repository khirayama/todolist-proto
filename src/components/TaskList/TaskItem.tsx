import { KeyboardEvent } from "react";
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

export function TaskItem(props: {
  disabled?: boolean;
  index: number;
  task: Task;
  newTaskText: string;
  handleInsertTaskButtonClick: (idx: number) => void;
}) {
  const router = useRouter();
  const task = props.task;

  const [, { updateTask }] = useTasks();
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
        ref={setNodeRef}
        style={style}
        className={clsx(
          "relative flex border-b",
          isDragging && "z-10 border-t",
          task.completed ? "bg-gray-100" : "bg-white"
        )}
      >
        {props.newTaskText && props.index === 0 && !isSorting ? (
          <button
            disabled={props.disabled}
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
            "flex items-center justify-center py-2 pl-3 pr-2 text-gray-400 touch-none"
          )}
        >
          <Icon text="drag_indicator" />
        </span>
        <span className="flex items-center pr-4 py-2">
          <Checkbox
            disabled={props.disabled}
            className="border flex w-6 h-6 justify-center items-center rounded-full overflow-hidden"
            checked={task.completed}
            onCheckedChange={(v: boolean) => {
              updateTask({
                ...task,
                completed: v,
              });
            }}
          >
            <CheckboxIndicator className="bg-gray-100 text-gray-400 w-full h-full justify-center items-center flex">
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
          tabIndex={props.disabled ? -1 : 0}
          className="flex items-center justify-center pl-2 pr-4 py-2 text-gray-400 cursor-pointer"
          href="/app"
          params={{ sheet: "datepicker", taskid: task.id }}
          mergeParams
        >
          {task.date || <Icon text="event" />}
        </ParamsLink>
        {props.newTaskText && !isSorting ? (
          <button
            disabled={props.disabled}
            className="flex items-center justify-center absolute z-10 bottom-0 right-12 translate-y-[50%] bg-white rounded-full w-8 h-8 border text-gray-400"
            onClick={() => props.handleInsertTaskButtonClick(props.index + 1)}
          >
            <Icon text="add" />
          </button>
        ) : null}
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
