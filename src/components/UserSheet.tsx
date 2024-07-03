import { useState, useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import qs from "query-string";

import { ParamsSheet } from "libs/components/ParamsSheet";
import { useSupabase } from "libs/supabase";
import { useCustomTranslation } from "libs/i18n";
import { useApp } from "hooks/useApp";
import { useProfile } from "hooks/useProfile";
import { useTaskLists } from "hooks/useTaskLists";

export function UserSheet(props: {
  open: (q?: Query) => boolean;
  handleSignedIn?: () => void;
  handleSignedOut?: () => void;
}) {
  const { t } = useCustomTranslation("components.UserSheet");
  const { supabase, isLoggedIn } = useSupabase();
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

  useEffect(() => {
    const q = qs.parse(window.location.search);
    if (isLoggedIn && props.open(q)) {
      props.handleSignedIn?.();
    }
  }, [isLoggedIn]);

  return (
    <ParamsSheet open={props.open} title={t("Log In")}>
      {!isLoggedIn ? (
        <div className="p-4 max-w-[480px] mx-auto">
          <Auth
            supabaseClient={supabase}
            appearance={{
              // theme: ThemeSupa,
              extend: false,
              className: {
                anchor: "block text-gray-400 py-1",
                button: "w-full py-2 px-4 border rounded my-4",
                container: "classname-container",
                divider: "classname-divider",
                label: "block text-gray-400",
                input: "border rounded w-full py-2 px-4 mb-4",
                loader: "classname-loader",
                message: "classname-message",
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: t("Email"),
                  email_input_placeholder: t("Email"),
                  password_label: t("Password"),
                  password_input_placeholder: t("Password"),
                  button_label: t("Log In"),
                  loading_button_label: t("Logging In"),
                  link_text: t("Already have an account? Log in"),
                },
                sign_up: {
                  email_label: t("Email"),
                  email_input_placeholder: t("Email"),
                  password_label: t("Password"),
                  password_input_placeholder: t("Password"),
                  button_label: t("Sign Up"),
                  loading_button_label: t("Signing Up"),
                  link_text: t("Don't have an account? Sign up"),
                },
                forgotten_password: {
                  email_label: t("Email"),
                  email_input_placeholder: t("Email"),
                  button_label: t("Send reset password instructions"),
                  loading_button_label: "loading button label",
                  link_text: t("Forgot your password?"),
                },
              },
            }}
            providers={[]}
          />
        </div>
      ) : (
        <div>
          <div className="flex p-4">
            <div className="flex-1 pr-4">
              <input
                className="w-full py-2 px-4 border rounded"
                type="text"
                placeholder={t("New display name")}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                }}
              />
            </div>
            <button
              className="border rounded p-2 px-4"
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
                className="w-full py-2 px-4 border rounded"
                type="email"
                placeholder={t("New email")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            <button
              className="border rounded p-2 px-4"
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
                  className="w-full py-2 px-4 border rounded"
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
                  className="w-full py-2 px-4 border rounded"
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
                className="border rounded p-2 px-4"
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
              className="w-full py-2 px-4 border rounded"
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
              className="w-full py-2 px-4 border rounded text-red-400"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete your account?"
                  )
                ) {
                  Promise.all(
                    app.taskListIds.map((tlid) => {
                      deleteTaskList(tlid);
                    })
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
      )}
    </ParamsSheet>
  );
}
