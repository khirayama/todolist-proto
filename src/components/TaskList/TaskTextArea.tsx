import { FormEvent } from "react";
import { clsx } from "clsx";

export function TaskTextArea(props: {
  task: Task;
  disabled?: boolean;
  onTaskTextChange: (event: FormEvent<HTMLTextAreaElement>) => void;
}) {
  const task = props.task;

  /* FYI: Autoresize textarea */
  return (
    <div
      className={clsx(
        "relative flex-1 py-3",
        task.completed ? "text-gray-400 line-through" : "",
      )}
    >
      <div className="invisible whitespace-break-spaces px-1">
        {task.text + "\u200b"}
      </div>
      <textarea
        disabled={props.disabled}
        className={clsx(
          "absolute left-0 top-0 inline-block h-full w-full flex-1 whitespace-break-spaces rounded px-1 py-3 focus-visible:bg-gray-200",
          task.completed ? "text-gray-400 line-through" : "",
        )}
        value={task.text}
        onChange={props.onTaskTextChange}
      />
    </div>
  );
}
