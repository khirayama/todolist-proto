import { useState, useRef } from "react";
import { clsx } from "clsx";

import { useGlobalState } from "libs";
import { TaskList } from "components/TaskList";
import { TaskListList } from "components/TaskListList";
import { Icon } from "components/Icon";
import { Sheet } from "components/Sheet";

function Settings() {
  return (
    <>
      <div>Account</div>
      <div>Theme</div>
      <div>Lang</div>
    </>
  );
}

function SettingsSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange} title="設定">
      <Settings />
    </Sheet>
  );
}

function TaskListSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskLists: TaskList[];
  handleTaskListChange: (updatedTaskList: TaskList) => void;
  handleTaskListsChange: (updateTaskLists: TaskList[]) => void;
  handleTaskListLinkClick: (taskListId: string) => void;
}) {
  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="タスクリストを編集"
    >
      <TaskListList
        taskLists={props.taskLists}
        handleTaskListChange={props.handleTaskListChange}
        handleTaskListsChange={props.handleTaskListsChange}
        handleTaskListLinkClick={props.handleTaskListLinkClick}
      />
    </Sheet>
  );
}

export default function IndexPage() {
  const [globalState, setGlobalState] = useGlobalState();

  const [taskListSheetOpen, setTaskListSheetOpen] = useState(false);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [sortingTaskListId, setSortingTaskListId] = useState<string>("");
  const taskLists = globalState.app.taskListIds.map(
    (tlid) => globalState.taskLists[tlid]
  );
  const taskListContainerRef = useRef<HTMLElement>(null);

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
    setTaskListSheetOpen(false);
    const el = taskListContainerRef.current;
    if (el) {
      const w = el.clientWidth;
      const idx = taskLists.findIndex((tl) => tl.id === taskListId);
      el.scrollLeft = w * idx;
    }
  };
  const handleTaskListSheetOpenClick = () => {
    setTaskListSheetOpen(true);
  };
  const handleSettingsSheetOpenClick = () => {
    setSettingsSheetOpen(true);
  };

  return (
    <>
      <div className="flex relative w-full h-full bg-gray-100 overflow-hidden">
        <section className="absolute top-0 left-0 h-full bg-white z-10 border-r">
          <TaskListList
            taskLists={taskLists}
            handleTaskListChange={handleTaskListChange}
            handleTaskListsChange={handleTaskListsChange}
            handleTaskListLinkClick={handleTaskListLinkClick}
          />
        </section>

        <section className="flex flex-col h-full max-w-lg mx-auto w-full border-x z-20">
          <div className="flex p-4 bg-white">
            <button
              className="flex items-center justify-center"
              onClick={handleTaskListSheetOpenClick}
            >
              <Icon text="list" />
            </button>
            <div className="flex-1" />
            <button
              className="flex items-center justify-center"
              onClick={handleSettingsSheetOpenClick}
            >
              <Icon text="settings" />
            </button>
          </div>

          <section
            ref={taskListContainerRef}
            className={clsx(
              "flex-1 bg-gray-100 flex relative w-full snap-mandatory snap-x flex-row flex-nowrap",
              /* FYI: Prevent x-scroll position when sorting after 2nd taskLists */
              sortingTaskListId ? "overflow-visible" : "overflow-scroll"
            )}
          >
            {taskLists.map((taskList) => {
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
                      taskList={taskList}
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

        <section className="absolute top-0 right-0 w-[240px] h-full bg-white z-10 border-l">
          <Settings />
        </section>
      </div>

      <TaskListSheet
        open={taskListSheetOpen}
        onOpenChange={setTaskListSheetOpen}
        taskLists={taskLists}
        handleTaskListChange={handleTaskListChange}
        handleTaskListsChange={handleTaskListsChange}
        handleTaskListLinkClick={handleTaskListLinkClick}
      />

      <SettingsSheet
        open={settingsSheetOpen}
        onOpenChange={setSettingsSheetOpen}
      />
    </>
  );
}
