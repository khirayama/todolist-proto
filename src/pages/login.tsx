import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Auth } from "@supabase/auth-ui-react";
import qs from "query-string";

import { useSupabase } from "libs/supabase";
import { useCustomTranslation } from "libs/i18n";

export default function LoginPage() {
  const router = useRouter();

  const { t } = useCustomTranslation("pages.login");
  const { supabase, isLoggedIn } = useSupabase();

  useEffect(() => {
    if (isLoggedIn) {
      const url =
        (qs.parse(window?.location.search).redirect as string) || "/app";
      router.replace(url);
    }
  }, [isLoggedIn]);

  return (
    <div className="h-full">
      <header className="text-center absolute top-0 left-0 w-full">
        <h1 className="py-8">
          <Link href="/">
            <img src="/logo.svg" alt="Lightlist" className="inline h-[2rem]" />
          </Link>
        </h1>
      </header>

      <div className="py-12 max-w-sm mx-auto flex justify-center items-center h-full">
        <div className="pb-16">
          <Auth
            supabaseClient={supabase}
            appearance={{
              // theme: ThemeSupa,
              extend: false,
              className: {
                anchor:
                  "block text-gray-400 px-2 py-1 rounded focus-visible:bg-gray-200",
                button:
                  "w-full py-2 px-4 border rounded my-4 focus-visible:bg-gray-200",
                container: "classname-container",
                divider: "classname-divider",
                label: "block text-gray-400",
                input:
                  "border rounded w-full py-2 px-4 mb-4 focus-visible:bg-gray-200",
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
      </div>
    </div>
  );
}
