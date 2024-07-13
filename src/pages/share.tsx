import { useRouter } from "next/router";
import qs from "query-string";

import { useApp } from "hooks/useApp";
import { useTaskLists } from "hooks/useTaskLists";
import { useTasks } from "hooks/useTasks";
import { TaskList } from "components/TaskList";
import { useSupabase } from "libs/supabase";
import { UserSheet } from "components/UserSheet";
import { ParamsLink } from "libs/components/ParamsLink";
import { useCustomTranslation } from "libs/i18n";
import { Icon } from "libs/components/Icon";

function isUserSheetOpened() {
  return qs.parse(window?.location.search).sheet === "user";
}

const SharePageContent = () => {
  const router = useRouter();
  const shareCode = router.query.code as string;
  const { t } = useCustomTranslation("pages.share");

  const [{ data: app }, { updateApp }] = useApp("/api/app");
  const [{ data: taskLists, isInitialized }] = useTaskLists(
    shareCode ? `/api/task-lists?shareCodes=${shareCode}` : ""
  );
  const taskList = Object.values(taskLists).find(
    (taskList) => taskList.shareCode === shareCode
  );
  useTasks(taskList ? `/api/tasks?taskListIds=${taskList.id}` : "");
  const { isLoggedIn } = useSupabase();

  const hasTaskList = app.taskListIds.includes(taskList?.id);
  const distURL = isLoggedIn ? "/app" : "/login";

  return (
    <>
      <section>
        <header className="max-w-lg mx-auto flex justify-center items-center p-2">
          <ParamsLink href={distURL}>
            <img
              src="/logo.svg"
              alt="Lightlist"
              className="inline h-[1.5rem]"
            />
          </ParamsLink>
          <div className="flex-1" />
          <ParamsLink href={distURL}>
            <Icon text="close" />
          </ParamsLink>
        </header>

        <section className="max-w-lg mx-auto p-2">
          {!hasTaskList ? (
            <div className="">
              {isLoggedIn ? (
                <button
                  className="border px-2 py-1 w-full rounded focus:bg-gray-200"
                  disabled={hasTaskList}
                  onClick={() => {
                    updateApp({
                      taskListIds: [...app.taskListIds, taskList.id],
                    });
                    router.push(distURL);
                  }}
                >
                  {t("Add my task list")}
                </button>
              ) : (
                <div className="text-center">
                  <ParamsLink
                    href="/login"
                    params={{ redirect: location.href }}
                    className="inline-block border px-2 py-1 w-full rounded focus:bg-gray-200"
                  >
                    {t("Log in to add this task list")}
                  </ParamsLink>
                </div>
              )}
            </div>
          ) : null}
        </section>

        {hasTaskList ? (
          <div className="bg-red-400 p-2 text-center text-white">
            {t("Already added")}
          </div>
        ) : (
          <div className="bg-red-400 p-2 text-center text-white">
            {t("Please join {{name}} list!", {
              name: taskList?.name,
            })}
          </div>
        )}
        <div className="border-t pb-8" />

        <div className="max-w-xl mx-auto">
          {!shareCode ? (
            <div className="py-12 text-center">{t("No share code")}</div>
          ) : !isInitialized ? (
            <div className="py-12 text-center">{t("Loading")}</div>
          ) : !taskList ? (
            <div className="py-12 text-center">
              {t("No matched task list with the share code")}
            </div>
          ) : (
            <TaskList key={taskList.id} taskList={taskList} />
          )}
        </div>
      </section>

      <UserSheet open={isUserSheetOpened} />
    </>
  );
};

export default function SharePage() {
  const { isInitialized } = useSupabase();
  return isInitialized ? <SharePageContent /> : null;
}
