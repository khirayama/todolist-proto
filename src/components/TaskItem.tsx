import { FormEvent, KeyboardEvent, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Root as Checkbox,
  Indicator as CheckboxIndicator,
} from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { clsx } from "clsx";

import { useTasks } from "hooks/useTasks";
import { Icon } from "libs/components/Icon";
import { DatePickerSheet } from "components/DatePickerSheet";

function TaskTextArea(props: {
  task: Task;
  onTaskTextChange: (event: FormEvent<HTMLTextAreaElement>) => void;
  onTaskTextKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const task = props.task;

  /* FYI: Autoresize textarea */
  return (
    <div
      className={clsx(
        "relative flex-1 py-4",
        task.completed ? "line-through text-gray-400" : ""
      )}
    >
      <div className="whitespace-break-spaces invisible">
        {task.text + "\u200b"}
      </div>
      <textarea
        className={clsx(
          "absolute inline-block top-0 left-0 w-full h-full flex-1 py-4 whitespace-break-spaces",
          task.completed ? "line-through text-gray-400" : ""
        )}
        value={task.text}
        onChange={props.onTaskTextChange}
        onKeyDown={props.onTaskTextKeyDown}
      />
    </div>
  );
}

export function TaskItem(props: {
  index: number;
  task: Task;
  newTaskText: string;
  handleInsertTaskButtonClick: (idx: number) => void;
  handleTaskListItemKeyDown: (
    e: KeyboardEvent,
    options: {
      task: Task;
      setDatePickerSheetOpen: (open: boolean) => void;
      setHasFocusWhenOpeningDatePickerSheet: (hasFocus: boolean) => void;
    }
  ) => void;
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
  const [
    hasFocusWhenOpeningDatePickerSheet,
    setHasFocusWhenOpeningDatePickerSheet,
  ] = useState(false);
  const [, { updateTask }] = useTasks();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const mustHaveClassNames = ["touch-none"];
  const [datePickerSheetOpen, setDatePickerSheetOpen] = useState(false);

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
          task={task}
          // onFocus, onBlurで、focus状態か保存して、DatePickerから戻ってきた時に維持するか考える
          onTaskTextChange={(e) => {
            updateTask({
              ...task,
              text: e.currentTarget.value,
            });
          }}
          onTaskTextKeyDown={(e) => {
            props.handleTaskListItemKeyDown(e, {
              task,
              setDatePickerSheetOpen,
              setHasFocusWhenOpeningDatePickerSheet,
            });
          }}
        />
        <button
          data-taskdatepicker={task.id}
          className="flex items-center justify-center pl-2 pr-4 py-2 text-gray-400 cursor-pointer"
          onPointerDown={() => {
            if (
              document.activeElement ===
              document.querySelector(`[data-taskid="${task.id}"] textarea`)
            ) {
              // TODO: ここで、targetとしてe.currentTargetを保存し、click event時に同じe.currentTargetか確認する
              setHasFocusWhenOpeningDatePickerSheet(true);
            }
          }}
          onClick={() => {
            setDatePickerSheetOpen(true);
          }}
        >
          {task.date || <Icon text="event" />}
        </button>
        {props.newTaskText && !isSorting ? (
          <button
            className="flex items-center justify-center absolute z-10 bottom-0 right-12 translate-y-[50%] bg-white rounded-full w-8 h-8 border text-gray-400"
            onClick={() => props.handleInsertTaskButtonClick(props.index + 1)}
          >
            <Icon text="add" />
          </button>
        ) : null}
      </div>

      <DatePickerSheet
        value={task.date}
        open={datePickerSheetOpen}
        onOpenChange={setDatePickerSheetOpen}
        handleChange={(v) => {
          updateTask({
            ...task,
            date: v,
          });
          if (hasFocusWhenOpeningDatePickerSheet) {
            const t = document.querySelector<HTMLTextAreaElement>(
              `[data-taskid="${task.id}"] textarea`
            );
            t.selectionStart = t.value.length;
            t.selectionEnd = t.value.length;
            t?.focus();
          } else {
            const t = document.querySelector<HTMLTextAreaElement>(
              `[data-taskdatepicker="${task.id}"]`
            );
            t?.focus();
          }
          setDatePickerSheetOpen(false);
          setHasFocusWhenOpeningDatePickerSheet(false);
        }}
        handleCancel={() => {
          setDatePickerSheetOpen(false);
          setHasFocusWhenOpeningDatePickerSheet(false);
        }}
      />
    </>
  );
}
