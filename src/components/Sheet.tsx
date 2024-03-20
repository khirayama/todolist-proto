import { useState, useEffect, ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";

import { Icon } from "components/Icon";

export function Sheet(props: {
  children: ReactNode;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(props.open);
  useEffect(() => {
    if (!props.open) {
      setTimeout(() => {
        setIsOpen(props.open);
      }, 600);
    } else {
      setIsOpen(props.open);
    }
  }, [props.open]);

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={props.onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={clsx(
            "fixed w-full h-full top-0 left-0 z-30 bg-gray-900/50",
            props.open &&
              `animate-[overlayshow_600ms_cubic-bezier(0.16,1,0.3,1)_forwards]`,
            !props.open &&
              `animate-[overlayhide_600ms_cubic-bezier(0.16,1,0.3,1)_forwards]`
          )}
        />
        <RadixDialog.Content
          className={clsx(
            "fixed bottom-0 left-1/2 translate-x-[-50%] w-full max-w-lg mx-auto min-h-[80%] rounded-t-lg shadow-lg z-40 bg-white",
            props.open &&
              `animate-[contentshow_600ms_cubic-bezier(0.16,1,0.3,1)_forwards]`,
            !props.open &&
              `animate-[contenthide_600ms_cubic-bezier(0.16,1,0.3,1)_forwards]`
          )}
        >
          <header className="flex w-full p-4 items-center justify-center relative">
            <div className="flex-1 font-bold text-center">{props.title}</div>
            <div className="absolute right-0 top-0 p-4">
              <RadixDialog.Close>
                <Icon text="close" />
              </RadixDialog.Close>
            </div>
          </header>
          {props.children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
