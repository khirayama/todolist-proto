// These styles apply to every route in the application
import { useEffect, useRef } from "react";
import type { AppProps } from "next/app";
import qs from "query-string";

import "libs/pages/globals.css";

import { GlobalStateProvider } from "libs/globalState";
import { SupabaseProvider } from "libs/supabase";
import { init as initI18n } from "libs/i18n";

initI18n();

export default function App({ Component, pageProps }: AppProps) {
  const isInitialRender = useRef(true);
  let isFastRefresh = false;

  useEffect(() => {
    isInitialRender.current = false;
  }, []);

  if (isInitialRender.current) {
    isFastRefresh = false;
  } else {
    isFastRefresh = true;
  }

  useEffect(() => {
    if (!isFastRefresh) {
      const query = qs.parse(window.location.search);
      if (Object.keys(query).length) {
        const tmp = window.location.href;
        window.history.replaceState({}, "", "/app");
        window.history.pushState({}, "", tmp);
      }
    }
  }, []);

  return (
    <SupabaseProvider>
      <GlobalStateProvider>
        <Component {...pageProps} />
      </GlobalStateProvider>
    </SupabaseProvider>
  );
}
