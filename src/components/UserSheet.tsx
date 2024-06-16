import { useState, useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
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
  const [{ data: app }] = useApp();
  const [{ data: profile }, { updateProfile }] = useProfile();
  const [, { deleteTaskList }] = useTaskLists();
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
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
        />
      ) : (
        <div>
          <div>
            <input
              type="text"
              placeholder="New display name"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
              }}
            />
            <button
              onClick={() => {
                updateProfile({ displayName });
              }}
            >
              Change displayName
            </button>
          </div>
          <div>
            <input
              type="email"
              placeholder="New email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <button
              onClick={() => {
                supabase.auth.updateUser({ email });
              }}
            >
              Update email
            </button>
          </div>
          <div>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmedPassword}
              onChange={(e) => {
                setConfirmedPassword(e.target.value);
              }}
            />
            <button
              disabled={!password || password !== confirmedPassword}
              onClick={() => {
                supabase.auth.updateUser({ password });
              }}
            >
              Update password
            </button>
          </div>
          <div>
            <button
              onClick={() => {
                supabase.auth.signOut().then(() => {
                  props.handleSignedOut?.();
                });
              }}
            >
              Sign out
            </button>
          </div>
          <div>
            <button
              className="text-red-400"
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
              Delete my account
            </button>
          </div>
        </div>
      )}
    </ParamsSheet>
  );
}
