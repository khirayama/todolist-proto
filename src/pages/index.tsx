import { useState, useRef } from "react";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";

import { useGlobalState } from "libs";
import { TaskList } from "components/TaskList";
import { TaskListList } from "components/TaskListList";
import { Icon } from "components/Icon";
import { UserSheet } from "components/UserSheet";
import { PreferencesSheet } from "components/PreferencesSheet";
import { InvitationSheet } from "components/InvitationSheet";

export default function IndexPage() {
  const { t, i18n } = useTranslation();
  const tr = (key: string) => t(`pages.index.${key}`);

  const [globalState, setGlobalState] = useGlobalState();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [userSheetOpen, setUserSheetOpen] = useState(false);
  const [invitationSheetOpen, setInvitationSheetOpen] = useState(false);
  const [sortingTaskListId, setSortingTaskListId] = useState<string>("");
  const taskLists = globalState.app.taskListIds.map(
    (tlid) => globalState.taskLists[tlid]
  );
  const taskListContainerRef = useRef<HTMLElement>(null);
  const preferences = globalState.app.preferences;
  if (i18n.resolvedLanguage !== preferences.lang) {
    i18n.changeLanguage(preferences.lang);
  }

  const handlePreferencesChange = (newPreferences: Partial<Preferences>) => {
    setGlobalState({
      ...globalState,
      app: {
        ...globalState.app,
        preferences: {
          ...globalState.app.preferences,
          ...newPreferences,
        },
      },
    });
  };
  const handleTaskListChange = (newTaskList: TaskList) => {
    setGlobalState({
      ...globalState,
      taskLists: {
        ...globalState.taskLists,
        [newTaskList.id]: newTaskList,
      },
    });
  };
  const handleTaskListsChange = (newTaskLists: TaskList[]) => {
    const newTaskListsMap = {
      ...globalState.taskLists,
    };
    newTaskLists.forEach((tl) => {
      newTaskListsMap[tl.id] = tl;
    });

    setGlobalState({
      ...globalState,
      app: {
        ...globalState.app,
        taskListIds: newTaskLists.map((tl) => tl.id),
      },
      taskLists: newTaskListsMap,
    });
  };
  const handleTaskListLinkClick = (taskListId: string) => {
    setIsDrawerOpen(false);
    const parent = taskListContainerRef.current;
    const el = document.querySelector<HTMLElement>(
      `[data-tasklistid="${taskListId}"]`
    );
    if (parent && el) {
      parent.scrollLeft = el.offsetLeft;
    }
  };
  const handleTaskListIconClick = () => {
    setIsDrawerOpen(true);
  };
  const handleDrawerCloseIconClick = () => {
    setIsDrawerOpen(false);
  };
  const handleSettingsSheetOpenClick = () => {
    setSettingsSheetOpen(true);
  };
  const handleUserSheetOpenClick = () => {
    setUserSheetOpen(true);
  };
  const handleInvitationSheetOpenClick = () => {
    setInvitationSheetOpen(true);
  };

  return (
    <>
      <div className="flex w-full h-full bg-gray-100 overflow-hidden">
        <section
          className={clsx(
            "h-full bg-white z-30 border-r md:max-w-sm w-full md:w-[auto] absolute md:relative md:block -translate-x-full md:translate-x-0 transition-transform duration-[320ms]",
            isDrawerOpen && "translate-x-0"
          )}
        >
          <div className="flex md:hidden">
            <button
              className="flex items-center justify-center px-4 pt-4 w-full"
              onClick={handleDrawerCloseIconClick}
            >
              <Icon text="close" />
              <div className="flex-1" />
            </button>
          </div>
          <div className="py-2">
            <button
              className="flex items-center justify-center px-4 py-2 w-full"
              onClick={handleUserSheetOpenClick}
            >
              <div className="flex-1 text-left">{tr("Log In")}</div>
              <Icon text="person" />
            </button>

            <button
              className="flex items-center justify-center px-4 py-2 w-full"
              onClick={handleSettingsSheetOpenClick}
            >
              <div className="flex-1 text-left">{tr("Preferences")}</div>
              <Icon text="settings" />
            </button>
          </div>
          <div className="pt-2 border-t">
            <TaskListList
              taskLists={taskLists}
              handleTaskListChange={handleTaskListChange}
              handleTaskListsChange={handleTaskListsChange}
              handleTaskListLinkClick={handleTaskListLinkClick}
            />
          </div>
        </section>

        <section className="flex flex-col h-full md:max-w-lg min-w-[375px] mx-auto w-full border-x">
          <header className="flex p-4 bg-white">
            <button
              className="flex md:hidden items-center justify-center"
              onClick={handleTaskListIconClick}
            >
              <Icon text="list" />
            </button>

            <div className="flex-1" />

            <button
              className="flex items-center justify-center"
              onClick={handleInvitationSheetOpenClick}
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
            {taskLists.map((taskList, i) => {
              const handleTaskChange = (newTask: Task) => {
                setGlobalState({
                  ...globalState,
                  taskLists: {
                    ...globalState.taskLists,
                    [taskList.id]: {
                      ...taskList,
                      tasks: taskList.tasks.map((t) => {
                        if (t.id === newTask.id) {
                          return newTask;
                        }
                        return t;
                      }),
                    },
                  },
                });
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
                      insertPosition={preferences.taskInsertPosition}
                      taskList={taskList}
                      handlePreferencesChange={handlePreferencesChange}
                      handleTaskChange={handleTaskChange}
                      handleTaskListChange={handleTaskListChange}
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
        open={settingsSheetOpen}
        onOpenChange={setSettingsSheetOpen}
        handlePreferencesChange={handlePreferencesChange}
      />

      <UserSheet open={userSheetOpen} onOpenChange={setUserSheetOpen} />

      <InvitationSheet
        open={invitationSheetOpen}
        onOpenChange={setInvitationSheetOpen}
      />
    </>
  );
}
