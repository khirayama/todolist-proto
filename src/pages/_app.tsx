// These styles apply to every route in the application
import type { AppProps } from "next/app";
import { useEffect } from "react";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";

import { GlobalStateProvider } from "libs/globalState";
import { SupabaseProvider } from "libs/supabase";
import { init as initI18n } from "libs/i18n";

import "libs/pages/globals.css";

initI18n();

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return (
    <>
      <Head>
        <link rel="icon" href="/logo.png" />
        <title>Lightlist</title>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"
        />
      </Head>
      <SupabaseProvider>
        <GlobalStateProvider>
          <Analytics />
          <Component {...pageProps} />
        </GlobalStateProvider>
      </SupabaseProvider>
    </>
  );
}
