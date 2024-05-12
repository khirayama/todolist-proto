import { Sheet } from "libs/components/Sheet";
import { useTranslation } from "react-i18next";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { useSupabase } from "libs/supabase";

export function UserSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const tr = (key: string) => t(`components.UserSheet.${key}`);
  const { supabase, user } = useSupabase();

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={tr("Log In")}
    >
      {!user ? (
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
        />
      ) : (
        <div>
          <div>{JSON.stringify(user, null, 2)}</div>
          <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
      )}
    </Sheet>
  );
}
