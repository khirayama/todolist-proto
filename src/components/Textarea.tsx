import { FormEvent, KeyboardEvent } from "react";
import clsx from "clsx";

export function Textarea(props: {
  value: string;
  className?: string;
  placeholder?: string;
  onChange?: (event?: FormEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event?: KeyboardEvent<HTMLTextAreaElement>) => void;
  onKeyUp?: (event?: KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const classNames = [
    "inline-block",
    "w-full",
    "h-full",
    "whitespace-break-spaces",
  ];
  return (
    <div className={clsx("relative overflow-hidden", props.className)}>
      <textarea
        {...props}
        rows={1}
        className={clsx("absolute resize-none inline-block", classNames)}
      />
      <div className={clsx("z-[-1] select-none", classNames)}>
        {props.value + "\u200b"}
      </div>
    </div>
  );
}
