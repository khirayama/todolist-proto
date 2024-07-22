import { useState, useEffect } from "react";

import { ParamsSheet } from "libs/components/ParamsSheet";
import { useSupabase } from "libs/supabase";
import { useCustomTranslation } from "libs/i18n";
import { useApp } from "hooks/useApp";
import { useProfile } from "hooks/useProfile";
import { useTaskLists } from "hooks/useTaskLists";

export function UserSheet(props: {
  open: (q?: Query) => boolean;
  handleSignedOut?: () => void;
}) {
  const { t } = useCustomTranslation("components.UserSheet");
  const { supabase } = useSupabase();
  const [{ data: app }] = useApp("/api/app");
  const [{ data: profile }, { updateProfile }] = useProfile("/api/profile");
  const [, { deleteTaskList }] = useTaskLists("/api/task-lists");
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");

  useEffect(() => {
    if (props.open) {
      setEmail(profile.email);
    }
  }, [props.open, profile.email]);

  useEffect(() => {
    if (props.open) {
      setDisplayName(profile.displayName);
    }
  }, [props.open, profile.displayName]);

  return (
    <ParamsSheet open={props.open} title={t("Log In")}>
      <div>
        <div className="flex p-4">
          <div className="flex-1 pr-4">
            <input
              className="w-full rounded border px-4 py-2 focus-visible:bg-gray-200 dark:focus-visible:bg-gray-700"
              type="text"
              placeholder={t("New display name")}
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
              }}
            />
          </div>
          <button
            className="rounded border bg-gray-100 p-2 px-4 focus-visible:bg-gray-200 dark:bg-gray-600 dark:focus-visible:bg-gray-700"
            onClick={() => {
              updateProfile({ displayName });
            }}
          >
            {t("Change display name")}
          </button>
        </div>

        <div className="flex p-4">
          <div className="flex-1 pr-4">
            <input
              className="w-full rounded border px-4 py-2 focus-visible:bg-gray-200 dark:focus-visible:bg-gray-700"
              type="email"
              placeholder={t("New email")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          <button
            className="rounded border bg-gray-100 p-2 px-4 focus-visible:bg-gray-200 dark:bg-gray-600 dark:focus-visible:bg-gray-700"
            onClick={() => {
              supabase.auth.updateUser({ email });
            }}
          >
            {t("Change email")}
          </button>
        </div>

        <div className="flex p-4">
          <div className="flex-1 pr-4">
            <div className="pb-4">
              <input
                className="w-full rounded border px-4 py-2 focus-visible:bg-gray-200 dark:focus-visible:bg-gray-700"
                type="password"
                placeholder={t("New password")}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
            <div>
              <input
                className="w-full rounded border px-4 py-2 focus-visible:bg-gray-200 dark:focus-visible:bg-gray-700"
                type="password"
                placeholder={t("Confirm new password")}
                value={confirmedPassword}
                onChange={(e) => {
                  setConfirmedPassword(e.target.value);
                }}
              />
            </div>
          </div>
          <div>
            <button
              className="rounded border bg-gray-100 p-2 px-4 focus-visible:bg-gray-200 dark:bg-gray-600 dark:focus-visible:bg-gray-700"
              disabled={!password || password !== confirmedPassword}
              onClick={() => {
                supabase.auth.updateUser({ password });
              }}
            >
              {t("Update password")}
            </button>
          </div>
        </div>

        <div className="flex p-4">
          <button
            className="w-full rounded border bg-gray-100 px-4 py-2 focus-visible:bg-gray-200 dark:bg-gray-600 dark:focus-visible:bg-gray-700"
            onClick={() => {
              supabase.auth.signOut().then(() => {
                props.handleSignedOut?.();
              });
            }}
          >
            {t("Log out")}
          </button>
        </div>

        <div className="flex p-4">
          <button
            className="w-full rounded border bg-gray-100 px-4 py-2 text-red-400 focus-visible:bg-gray-200 dark:bg-gray-600 dark:focus-visible:bg-gray-700"
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete your account?")
              ) {
                Promise.all(
                  app.taskListIds.map((tlid) => {
                    deleteTaskList(tlid);
                  }),
                ).then(async () => {
                  const {
                    data: { user },
                  } = await supabase.auth.getUser();
                  supabase.auth.admin.deleteUser(user.id).then(() => {
                    props.handleSignedOut?.();
                  });
                });
              }
            }}
          >
            {t("Delete account")}
          </button>
        </div>
      </div>
    </ParamsSheet>
  );
}
