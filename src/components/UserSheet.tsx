import { useState, useEffect } from "react";
import { Sheet } from "libs/components/Sheet";
import { useTranslation } from "react-i18next";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const supabase = createClient(project, anonKey);

export function UserSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`components.UserSheet.${key}`);

  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // <div>Log In</div>
  // <div>Sign Up</div>
  // <div>User Info</div>
  // <div>Log Out</div>

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={tr("Log In")}
    >
      {!session ? (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
        />
      ) : (
        <div>
          <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
      )}
    </Sheet>
  );
}
