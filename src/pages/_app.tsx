// These styles apply to every route in the application
import { useEffect, useState } from "react";
import type { AppProps } from "next/app";

import "libs/pages/globals.css";

import { GlobalStateProvider } from "libs/globalState";
import { init as initI18n } from "libs/i18n";

initI18n();

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // let pendingUpdate = false;
    //
    // const next = document.querySelector("#__next");
    //
    // function viewportHandler(event) {
    //   if (pendingUpdate) return;
    //   pendingUpdate = true;
    //
    //   const viewport = event.target;
    //   requestAnimationFrame(() => {
    //     pendingUpdate = false;
    //     next.style.height = viewport.height + "px";
    //   });
    // }
    //
    // window.visualViewport.addEventListener("resize", viewportHandler);
  }, []);

  return mounted ? (
    <GlobalStateProvider>
      <Component {...pageProps} />
    </GlobalStateProvider>
  ) : null;
}
