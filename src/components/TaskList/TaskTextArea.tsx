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
        task.completed ? "line-through text-gray-400" : ""
      )}
    >
      <div className="whitespace-break-spaces invisible px-1">
        {task.text + "\u200b"}
      </div>
      <textarea
        disabled={props.disabled}
        className={clsx(
          "absolute inline-block top-0 left-0 w-full h-full flex-1 px-1 py-3 whitespace-break-spaces rounded focus-visible:bg-gray-200",
          task.completed ? "line-through text-gray-400" : ""
        )}
        value={task.text}
        onChange={props.onTaskTextChange}
      />
    </div>
  );
}
