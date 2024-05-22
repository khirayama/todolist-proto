import { Sheet } from "libs/components/Sheet";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { useSupabase } from "libs/supabase";
import { useCustomTranslation } from "libs/i18n";

export function UserSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useCustomTranslation("components.UserSheet");
  const { supabase, isLoggedIn } = useSupabase();

  return (
    <Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t("Log In")}
    >
      {!isLoggedIn ? (
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
