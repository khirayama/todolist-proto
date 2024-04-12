import { useRef, FormEvent, KeyboardEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Root as Checkbox,
  Indicator as CheckboxIndicator,
} from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { clsx } from "clsx";

import { Icon } from "libs/components/Icon";

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
        task.complete ? "line-through text-gray-400" : ""
      )}
    >
      <div className="whitespace-break-spaces invisible">
        {task.text + "\u200b"}
      </div>
      <textarea
        className={clsx(
          "absolute inline-block top-0 left-0 w-full h-full flex-1 py-4 whitespace-break-spaces",
          task.complete ? "line-through text-gray-400" : ""
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
  handleTaskChange: (task: Task) => void;
  handleInsertTaskButtonClick: (idx: number) => void;
  handleTaskListItemKeyDown: (e: KeyboardEvent, task: Task) => void;
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
  const dateInputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const mustHaveClassNames = ["touch-none"];

  return (
    <div
      data-taskid={task.id}
      ref={setNodeRef}
      style={style}
      className={clsx(
        "relative flex border-b",
        isDragging && "z-10 border-t",
        task.complete ? "bg-gray-100" : "bg-white"
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
          checked={task.complete}
          onCheckedChange={(v: boolean) => {
            props.handleTaskChange({
              ...task,
              complete: v,
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
        onTaskTextChange={(e) => {
          props.handleTaskChange({
            ...task,
            text: e.currentTarget.value,
          });
        }}
        onTaskTextKeyDown={(e) => {
          props.handleTaskListItemKeyDown(e, task);
        }}
      />
      <label
        className="flex items-center justify-center pl-2 pr-4 py-2 text-gray-400 cursor-pointer"
        onClick={() => {
          dateInputRef.current?.focus();
          dateInputRef.current?.showPicker();
        }}
      >
        <input
          ref={dateInputRef}
          className="w-0"
          type="date"
          value={task.date}
          onInput={(e) => {
            /* FYI: On iOS, default RESET value is the day. For to be empty, set defaultValue blank. And it only works in onInput instead of onChange */
            e.currentTarget.defaultValue = "";
            props.handleTaskChange({
              ...task,
              date: e.currentTarget.value,
            });
          }}
        />
        {task.date || <Icon text="event" />}
      </label>
      {props.newTaskText && !isSorting ? (
        <button
          className="flex items-center justify-center absolute z-10 bottom-0 right-12 translate-y-[50%] bg-white rounded-full w-8 h-8 border text-gray-400"
          onClick={() => props.handleInsertTaskButtonClick(props.index + 1)}
        >
          <Icon text="add" />
        </button>
      ) : null}
    </div>
  );
}
