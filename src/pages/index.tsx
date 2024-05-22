import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { useRouter } from "next/router";
import Link from "next/link";

import { useApp } from "hooks/useApp";
import { usePreferences } from "hooks/usePreferences";
import { useTaskLists } from "hooks/useTaskLists";
import { Icon } from "libs/components/Icon";
import { TaskList } from "components/TaskList";
import { TaskListList } from "components/TaskListList";
import { UserSheet } from "components/UserSheet";
import { PreferencesSheet } from "components/PreferencesSheet";
import { InvitationSheet } from "components/InvitationSheet";
import { useCustomTranslation } from "libs/i18n";

function isDrawerOpened() {
  const hash = location.href.split("#")[1];
  return hash === "opened";
}

export default function IndexPage() {
  const router = useRouter();

  const { t } = useCustomTranslation("pages.index");

  const [app, { updateApp }] = useApp();
  const [preferences, { updatePreferences }] = usePreferences();
  const [
    ,
    { updateTaskList, updateTaskLists, updateTask },
    { getTaskListsById },
  ] = useTaskLists();

  const taskLists = getTaskListsById(app.taskListIds);

  const [isDrawerOpen, setIsDrawerOpen] = useState(isDrawerOpened());
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [userSheetOpen, setUserSheetOpen] = useState(false);
  const [invitationSheetOpen, setInvitationSheetOpen] = useState(false);
  const [sortingTaskListId, setSortingTaskListId] = useState<string>("");

  const taskListContainerRef = useRef<HTMLElement>(null);

  const lang = preferences.lang.toLowerCase();
  if (i18n.resolvedLanguage !== lang) {
    i18n.changeLanguage(lang);
  }

  useEffect(() => {
    const handleHashChange = () => {
      const drawer =
        document.querySelector<HTMLElement>(`[data-sectiondrawer]`);
      const main = document.querySelector<HTMLElement>(`[data-sectionmain]`);
      const selector = [
        "button",
        "a[href]",
        "input",
        "textarea",
        "select",
        "[role=button]",
        "[tabindex]",
      ].join(",");
      let el = null;
      if (isDrawerOpened()) {
        setIsDrawerOpen(true);
        el = drawer.querySelector(selector);
        el = drawer;
      } else {
        setIsDrawerOpen(false);
        el = main.querySelector(selector);
        el = main;
      }
      if (el) {
        el.focus();
        el.blur();
      }
    };

    setIsDrawerOpen(isDrawerOpened());
    router.events.on("hashChangeComplete", handleHashChange);
    return () => {
      router.events.off("hashChangeComplete", handleHashChange);
    };
  }, []);

  const handleTaskListLinkClick = (taskListId: string) => {
    router.push("/");
    const parent = taskListContainerRef.current;
    const el = document.querySelector<HTMLElement>(
      `[data-tasklistid="${taskListId}"]`
    );
    if (parent && el) {
      parent.scrollLeft = el.offsetLeft;
    }
  };
  const onSettingsSheetOpenClick = () => setSettingsSheetOpen(true);
  const onUserSheetOpenClick = () => setUserSheetOpen(true);
  const onInvitationSheetOpenClick = () => setInvitationSheetOpen(true);

  return (
    <>
      <div className="flex w-full h-full bg-gray-100 overflow-hidden">
        <section
          data-sectiondrawer
          className={clsx(
            "h-full bg-white z-30 border-r md:max-w-sm w-full md:w-[auto] absolute md:relative md:block -translate-x-full md:translate-x-0 transition-transform duration-[320ms]",
            isDrawerOpen && "translate-x-0"
          )}
        >
          <div className="flex md:hidden">
            <Link
              href="/"
              className="flex items-center justify-center px-4 pt-4 w-full"
            >
              <Icon text="close" />
              <div className="flex-1" />
            </Link>
          </div>
          <div className="py-2">
            <button
              className="flex items-center justify-center px-4 py-2 w-full"
              onClick={onUserSheetOpenClick}
            >
              <div className="flex-1 text-left">{t("Log In")}</div>
              <Icon text="person" />
            </button>

            <button
              className="flex items-center justify-center px-4 py-2 w-full"
              onClick={onSettingsSheetOpenClick}
            >
              <div className="flex-1 text-left">{t("Preferences")}</div>
              <Icon text="settings" />
            </button>
          </div>
          <div className="pt-2 border-t">
            <TaskListList
              taskLists={taskLists}
              handleTaskListChange={updateTaskList}
              handleTaskListsChange={updateTaskLists}
              handleTaskListLinkClick={handleTaskListLinkClick}
            />
          </div>
        </section>

        <section
          data-sectionmain
          className="flex flex-col h-full md:max-w-lg min-w-[375px] mx-auto w-full border-x"
        >
          <header className="flex p-4 bg-white">
            <Link
              href="/#opened"
              className="flex md:hidden items-center justify-center"
            >
              <Icon text="list" />
            </Link>

            <div className="flex-1" />

            <button
              className="flex items-center justify-center"
              onClick={onInvitationSheetOpenClick}
            >
              <Icon text="groups" />
            </button>
          </header>

          <section
            ref={taskListContainerRef}
            className={clsx(
              "flex-1 bg-gray-100 flex relative w-full snap-mandatory snap-x flex-row flex-nowrap",
              /* FYI: Prevent x-scroll position when sorting after 2nd taskLists */
              sortingTaskListId ? "overflow-visible" : "overflow-scroll"
            )}
          >
            {taskLists.map((taskList: TaskList, i: number) => {
              const handleTaskChange = (newTask: Task) => {
                updateTask(taskList, newTask);
              };
              const handleDragStart = () => {
                setSortingTaskListId(taskList.id);
              };
              const handleDragEnd = () => {
                setSortingTaskListId("");
              };

              return (
                <div
                  data-tasklistid={taskList.id}
                  key={taskList.id}
                  className={clsx(
                    "flex-none w-full snap-start snap-always relative",
                    {
                      hidden:
                        sortingTaskListId && sortingTaskListId !== taskList.id,
                    }
                  )}
                >
                  <div className="absolute w-full h-full overflow-scroll">
                    <TaskList
                      key={taskList.id}
                      hasPrev={i !== 0}
                      hasNext={i !== taskLists.length - 1}
                      insertPosition={app.taskInsertPosition}
                      taskList={taskList}
                      handleAppChange={updateApp}
                      handlePreferencesChange={updatePreferences}
                      handleTaskChange={handleTaskChange}
                      handleTaskListChange={updateTaskList}
                      handleDragStart={handleDragStart}
                      handleDragCancel={handleDragEnd}
                      handleDragEnd={handleDragEnd}
                    />
                  </div>
                </div>
              );
            })}
          </section>
        </section>

        <section
          className="lg:w-[15%] w-[0px]" /* FYI: Spacer to adjust list centering*/
        />
      </div>

      <PreferencesSheet
        preferences={preferences}
        open={settingsSheetOpen}
        onOpenChange={setSettingsSheetOpen}
        handlePreferencesChange={updatePreferences}
      />

      <UserSheet open={userSheetOpen} onOpenChange={setUserSheetOpen} />

      <InvitationSheet
        open={invitationSheetOpen}
        onOpenChange={setInvitationSheetOpen}
      />
    </>
  );
}
