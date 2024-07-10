import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { useRouter } from "next/router";
import Head from "next/head";
import qs from "query-string";

import { useApp } from "hooks/useApp";
import { useProfile } from "hooks/useProfile";
import { usePreferences } from "hooks/usePreferences";
import { useTaskLists } from "hooks/useTaskLists";
import { Icon } from "libs/components/Icon";
import { TaskList } from "components/TaskList";
import { TaskListList } from "components/TaskListList";
import { UserSheet } from "components/UserSheet";
import { PreferencesSheet } from "components/PreferencesSheet";
import { useCustomTranslation } from "libs/i18n";
import { createDebounce, isNarrowLayout } from "libs/common";
import { ParamsLink } from "libs/components/ParamsLink";

const scrollDebounce = createDebounce();

function isDrawerOpened() {
  return qs.parse(window.location.search).drawer === "opened";
}

function isSettingsSheetOpened() {
  return qs.parse(window.location.search).sheet === "settings";
}

function isUserSheetOpened() {
  return qs.parse(window.location.search).sheet === "user";
}

export default function AppPage() {
  /* Page Stack Control and support fast refresh */
  const isInitialRender = useRef(true);
  useEffect(() => {
    isInitialRender.current = false;
    const isFastRefresh = !isInitialRender.current;
    if (!isFastRefresh) {
      const query = qs.parse(window.location.search);
      if (Object.keys(query).length) {
        const tmp = window.location.href;
        window.history.replaceState({}, "", "/app");
        window.history.pushState({}, "", tmp);
      }
    }
  }, []);

  const router = useRouter();
  const closeDrawer = () => {
    router.back();
  };

  const { t, i18n } = useCustomTranslation("pages.app");

  const [{ data: app }, { updateApp }] = useApp("/api/app");
  const [{ data: profile }, { updateProfile }] = useProfile("/api/profile");
  const [{ data: preferences }] = usePreferences("/api/preferences");
  const [, , { getTaskListsById }] = useTaskLists("/api/task-lists");

  const taskLists = getTaskListsById(app.taskListIds);

  const [isDrawerOpen, setIsDrawerOpen] = useState(isDrawerOpened());
  const [isDrawerDisabled, setIsDrawerDisabled] = useState(
    isNarrowLayout() && !isDrawerOpen
  );
  const [sortingTaskListId, setSortingTaskListId] = useState<string>("");
  const [currentTaskListId, setCurrentTaskListId] = useState<string>(
    app?.taskListIds[0] || ""
  );

  const taskListContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    i18n.changeLanguage(preferences.lang.toLowerCase());
  }, [preferences.lang.toLowerCase()]);

  useEffect(() => {
    if (!currentTaskListId) {
      setCurrentTaskListId(app.taskListIds[0]);
    }
  }, [app]);

  useEffect(() => {
    const handleResize = () => {
      setIsDrawerDisabled(isNarrowLayout() && !isDrawerOpen);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isNarrowLayout(), isDrawerOpen]);

  useEffect(() => {
    const handleScroll = () => {
      scrollDebounce(() => {
        const parent = taskListContainerRef.current;
        if (parent) {
          const els = parent.querySelectorAll<HTMLElement>(`[data-tasklistid]`);
          for (let i = 0; i < els.length; i++) {
            if (Math.abs(els[i].offsetLeft - parent.scrollLeft) < 10) {
              const taskListId = els[i].dataset.tasklistid;
              if (taskListId !== currentTaskListId) {
                setCurrentTaskListId(taskListId);
                const el = window.document.activeElement as HTMLElement;
                el.blur();
              }
              break;
            }
          }
        }
      }, 30);
    };

    handleScroll();
    taskListContainerRef.current?.addEventListener("scroll", handleScroll);
    return () => {
      taskListContainerRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [app, currentTaskListId]);

  useEffect(() => {
    const handleRouteChange = () => {
      const isOpened = isDrawerOpened();
      setIsDrawerOpen(isOpened);
      if (isOpened) {
        setTimeout(() => {
          const p = document.querySelector<HTMLElement>("[data-sectiondrawer]");
          const el = p?.querySelector<HTMLButtonElement>("button");
          el?.focus();
        }, 1);
      }
    };

    handleRouteChange();
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  const handleTaskListLinkClick = (taskListId: string) => {
    closeDrawer();

    const parent = taskListContainerRef.current;
    const el = document.querySelector<HTMLElement>(
      `[data-tasklistid="${taskListId}"]`
    );
    if (parent && el) {
      parent.scrollLeft = el.offsetLeft;
      setTimeout(() => {
        const text = el.querySelector<HTMLInputElement>("[data-tasktext]");
        text.focus();
      }, 100);
    }
  };

  const handleSignedOut = () => {
    updateApp({
      taskListIds: [],
    });
    updateProfile({
      displayName: "",
      email: "",
    });
  };

  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <div className="flex w-full h-full overflow-hidden">
        <section
          data-sectiondrawer
          className={clsx(
            "h-full bg-white z-30 border-r md:max-w-sm min-w-[320px] w-full md:w-[auto] absolute md:relative md:block -translate-x-full md:translate-x-0 transition-transform duration-[320ms]",
            isDrawerOpen && "translate-x-0"
          )}
        >
          <div className="flex md:hidden">
            <div className="p-2">
              <button
                disabled={isDrawerDisabled}
                className="p-2 rounded"
                onClick={closeDrawer}
              >
                <Icon text="close" />
              </button>
            </div>
            <div className="flex-1" />
          </div>

          <div className="py-2">
            <ParamsLink
              tabIndex={isDrawerDisabled ? -1 : 0}
              className="flex items-center justify-center px-4 py-2 w-full"
              href="/app"
              params={{ sheet: "user" }}
              mergeParams
            >
              <Icon text="person" />
              <div className="flex-1 text-left pl-2">
                {profile?.displayName || profile?.email || t("Log in")}
              </div>
            </ParamsLink>

            <ParamsLink
              tabIndex={isDrawerDisabled ? -1 : 0}
              className="flex items-center justify-center px-4 py-2 w-full"
              href="/app"
              params={{ sheet: "settings" }}
              mergeParams
            >
              <Icon text="settings" />
              <div className="flex-1 text-left pl-2">{t("Preferences")}</div>
            </ParamsLink>
          </div>
          <div className="pt-2 border-t">
            <TaskListList
              disabled={isDrawerDisabled}
              taskLists={taskLists}
              handleTaskListLinkClick={handleTaskListLinkClick}
            />
          </div>
        </section>

        <section
          data-sectionmain
          className="flex flex-col h-full md:max-w-lg min-w-[375px] mx-auto w-full"
        >
          <header className="flex p-4 bg-white">
            <ParamsLink
              className="flex md:hidden items-center justify-center"
              href="/app"
              params={{ drawer: "opened" }}
              mergeParams
            >
              <Icon text="menu" />
            </ParamsLink>

            <div className="flex-1" />
          </header>

          <div className="flex items-center justify-center pb-2">
            {taskLists.map((taskList, i) => {
              return (
                <button
                  key={`${i}-${taskList.id}`}
                  onClick={() => {
                    handleTaskListLinkClick(taskList.id);
                  }}
                >
                  <div
                    className={clsx(
                      "w-1 h-1 rounded-full mx-1",
                      currentTaskListId === taskList.id
                        ? "bg-gray-500"
                        : "bg-gray-200"
                    )}
                  />
                </button>
              );
            })}
          </div>

          <section
            ref={taskListContainerRef}
            className={clsx(
              "flex-1 flex relative w-full snap-mandatory snap-x flex-row flex-nowrap",
              /* FYI: Prevent x-scroll position when sorting after 2nd taskLists */
              sortingTaskListId ? "overflow-visible" : "overflow-scroll"
            )}
          >
            {taskLists.map((taskList: TaskList) => {
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
                      disabled={currentTaskListId !== taskList.id}
                      taskList={taskList}
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
        open={isSettingsSheetOpened}
      />

      <UserSheet
        open={isUserSheetOpened}
        handleSignedIn={closeDrawer}
        handleSignedOut={handleSignedOut}
      />
    </>
  );
}
