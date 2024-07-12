import { useState } from "react";

import { useSupabase } from "libs/supabase";
import { ParamsLink } from "libs/components/ParamsLink";
import { useCustomTranslation } from "libs/i18n";

export default function IndexPage() {
  const { isLoggedIn } = useSupabase();
  const { t, i18n } = useCustomTranslation("pages.index");

  const params = !isLoggedIn ? { drawer: "opened", sheet: "user" } : {};
  const [lang, setLang] = useState(i18n.resolvedLanguage);

  if (lang !== i18n.resolvedLanguage) {
    i18n.changeLanguage(lang);
  }

  return (
    <div>
      <header className="max-w-2xl mx-auto text-right py-4">
        <button
          className="px-4 py-2 rounded focus:bg-gray-200"
          onClick={() => {
            setLang("en");
          }}
        >
          English
        </button>
        <button
          className="px-4 py-2 rounded focus:bg-gray-200"
          onClick={() => {
            setLang("ja");
          }}
        >
          日本語
        </button>
      </header>
      <div className="pb-8">
        <div className="text-center pt-24 pb-4">
          <img
            src="/logo.svg"
            alt="Lightlist"
            className="m-auto w-[80px] py-4"
          />
          <h1 className="p-4 text-center">Lightlist</h1>
        </div>
        <div className="text-center p-4">
          <ParamsLink
            href="/app"
            params={params}
            className="border py-2 px-4 rounded-full focus:bg-gray-200"
          >
            {t("Get started")}
          </ParamsLink>
        </div>
        <div className="p-8 max-w-lg m-auto text-justify">
          <p className="my-4">
            {t("Lightlist is a simple task list service.")}
          </p>
          <p>
            {t(
              "It can be used as a ToDo list for task management or a shopping list. You can share lists with people who are not registered."
            )}
          </p>
        </div>
      </div>

      <div className="bg-gray-100 pt-8">
        <div className="relative aspect-video overflow-hidden max-w-3xl mx-auto">
          <img
            className="absolute shadow-2xl bottom-[-100px] w-[80%] min-w-[320px] left-[32px]"
            src={`/screenshot_${lang}_desktop.png`}
          />
          <img
            className="absolute shadow-2xl bottom-[-60px] w-[24%] min-w-[105px] right-[32px] rotate-6"
            src={`/screenshot_${lang}_mobile.png`}
          />
        </div>
      </div>

      <footer className="p-12 text-center">
        <div className="text-center p-4">
          <ParamsLink
            href="/app"
            params={params}
            className="border py-2 px-4 rounded-full focus:bg-gray-200"
          >
            {t("Get started")}
          </ParamsLink>
        </div>
      </footer>
    </div>
  );
}
