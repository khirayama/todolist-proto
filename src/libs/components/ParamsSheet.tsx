import { useState, useEffect, ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { useRouter } from "next/router";
import qs from "query-string";

import { Icon } from "libs/components/Icon";

export function ParamsSheet(props: {
  children: ReactNode;
  title: string;
  open: (q?: Query) => boolean;
}) {
  const router = useRouter();
  const query = qs.parse(window.location.search);
  const [isOpen, setIsOpen] = useState<boolean>(props.open(query));
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [trigger, setTrigger] = useState<string>(
    (query.trigger as string) || ""
  );

  useEffect(() => {
    const handleRouteChange = () => {
      const query = qs.parse(window.location.search);

      if (!props.open(query)) {
        setTimeout(() => {
          setIsOpen(false);
          setIsClosing(false);
          if (trigger) {
            const el = document.querySelector<
              HTMLAnchorElement | HTMLButtonElement
            >(`[data-trigger=${trigger}]`);
            setTimeout(() => {
              el.focus();
              setTrigger("");
            }, 0);
          }
        }, 600);
      } else {
        setTrigger((query.trigger as string) || "");
        setIsOpen(true);
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  return (
    <RadixDialog.Root
      open={isOpen}
      onOpenChange={(o) => {
        if (!o && !isClosing) {
          setIsClosing(true);
          router.back();
        }
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={clsx(
            "fixed w-full h-full top-0 left-0 z-[100] bg-gray-900/50",
            props.open(query) &&
              `animate-[overlayshow_600ms_cubic-bezier(0.16,1,0.3,1)_forwards]`,
            !props.open(query) &&
              `animate-[overlayhide_600ms_cubic-bezier(0.16,1,0.3,1)_forwards]`
          )}
        />
        <RadixDialog.Content
          className={clsx(
            "flex flex-col fixed bottom-0 left-1/2 translate-x-[-50%] w-full max-w-2xl mx-auto min-h-[80%] max-h-[95%] rounded-t-lg shadow-lg z-[400] bg-white overflow-hidden focus:bg-white",
            props.open(query) &&
              `animate-[contentshow_600ms_cubic-bezier(0.16,1,0.3,1)_forwards]`,
            !props.open(query) &&
              `animate-[contenthide_600ms_cubic-bezier(0.16,1,0.3,1)_forwards]`
          )}
        >
          <header className="flex w-full p-4 items-center justify-center sticky top-0 bg-white">
            <div className="flex-1 font-bold text-center">{props.title}</div>
            <div className="absolute right-0 top-0 p-2">
              <RadixDialog.Close className="p-2 rounded focus:bg-gray-200">
                <Icon text="close" />
              </RadixDialog.Close>
            </div>
          </header>
          <div className="flex-1 h-full w-full overflow-scroll">
            {props.children}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
