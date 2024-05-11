// These styles apply to every route in the application
import type { AppProps } from "next/app";

import "libs/pages/globals.css";

import { GlobalStateProvider } from "libs/globalState";
import { SupabaseProvider } from "libs/supabase";
import { init as initI18n } from "libs/i18n";

initI18n();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SupabaseProvider>
      <GlobalStateProvider>
        <Component {...pageProps} />
      </GlobalStateProvider>
    </SupabaseProvider>
  );
}
