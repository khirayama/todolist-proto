import { FormEvent, KeyboardEvent } from "react";
import { clsx } from "clsx";

export function TaskTextArea(props: {
  task: Task;
  disabled?: boolean;
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
        disabled={props.disabled}
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
