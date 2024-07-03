import Link from "next/link";
import { useRouter } from "next/router";
import qs from "query-string";

import { useApp } from "hooks/useApp";
import { useTaskLists } from "hooks/useTaskLists";
import { useTasks } from "hooks/useTasks";
import { TaskList } from "components/TaskList";
import { useSupabase } from "libs/supabase";
import { UserSheet } from "components/UserSheet";
import { ParamsLink } from "libs/components/ParamsLink";

function isUserSheetOpened() {
  return qs.parse(window.location.search).sheet === "user";
}

export default function SharePage() {
  const router = useRouter();
  const closeDrawer = () => {
    const query = { ...router.query };
    delete query.drawer;
    router.push("/app", { query });
  };

  const [{ data: app }, { updateApp }] = useApp("/api/app");

  const shareCode = router.query.code as string;
  const [{ data: taskLists }] = useTaskLists(
    shareCode ? `/api/task-lists?shareCodes=${shareCode}` : ""
  );
  const taskList = Object.values(taskLists).find(
    (taskList) => taskList.shareCode === shareCode
  );
  useTasks(taskList ? `/api/tasks?taskListIds=${taskList.id}` : "");
  const { isLoggedIn } = useSupabase();
  const hasTaskList = app.taskListIds.includes(taskList?.id);

  const distURL = isLoggedIn ? "/app" : "/";

  return (
    <>
      <section>
        <header>
          <Link href={distURL}>To Top</Link>
        </header>
        <div>
          <div>
            <Link href={distURL}>Decline</Link>
          </div>
          <div>
            {isLoggedIn ? (
              <button
                disabled={hasTaskList}
                onClick={() => {
                  updateApp({ taskListIds: [...app.taskListIds, taskList.id] });
                  router.push(distURL);
                }}
              >
                {hasTaskList ? "Already added" : "Add"}
              </button>
            ) : (
              <ParamsLink href="/share">Login</ParamsLink>
            )}
          </div>
        </div>
        <div>
          {!shareCode ? (
            <div>No share code</div>
          ) : taskList ? (
            <TaskList key={taskList.id} taskList={taskList} />
          ) : (
            <div>No match task list or loading</div>
          )}
        </div>
      </section>

      <UserSheet open={isUserSheetOpened} handleSignedIn={closeDrawer} />
    </>
  );
}
