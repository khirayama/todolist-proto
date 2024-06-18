import { useTranslation } from "react-i18next";
import { createContext, useContext, ReactNode, useState } from "react";

type GlobalState = State;

const config = {
  key: "__global_state",
  initialValue: (): GlobalState => {
    return {
      app: {
        taskInsertPosition: "BOTTOM",
        taskListIds: [],
      },
      profile: {
        displayName: "",
        email: "",
      },
      preferences: {
        lang: "EN",
        theme: "SYSTEM",
      },
      taskLists: {},
      tasks: {},
      fetching: {
        taskLists: {
          isInitialized: false,
          isLoading: false,
          queued: false,
        },
        tasks: {
          isInitialized: false,
          isLoading: false,
          queued: false,
        },
        app: {
          isInitialized: false,
          isLoading: false,
          queued: false,
        },
        profile: {
          isInitialized: false,
          isLoading: false,
          queued: false,
        },
        preferences: {
          isInitialized: false,
          isLoading: false,
          queued: false,
        },
      },
    };
  },
};

let snapshot: GlobalState = null;

const GlobalStateContext = createContext<
  [GlobalState, (newState: GlobalState) => void, () => GlobalState]
>([snapshot, () => {}, () => snapshot]);

export const GlobalStateProvider = (props: { children: ReactNode }) => {
  const changeLanguage = () => {
    const lang = snapshot.preferences.lang.toLowerCase();
    if (i18n.resolvedLanguage !== lang) {
      window.requestAnimationFrame(() => {
        i18n.changeLanguage(lang);
      });
    }
  };

  const [globalState, nativeSetGlobalState] = useState(config.initialValue());
  const { i18n } = useTranslation();

  snapshot = globalState;
  changeLanguage();

  const setGlobalState = (newState: GlobalState) => {
    changeLanguage();
    snapshot = newState;
    nativeSetGlobalState(snapshot);
  };

  const getGlobalStateSnapshot = () => snapshot;

  return (
    <GlobalStateContext.Provider
      value={[globalState, setGlobalState, getGlobalStateSnapshot]}
    >
      {props.children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = (): [
  GlobalState,
  (newState: GlobalState) => void,
  () => GlobalState,
] => {
  return useContext(GlobalStateContext);
};
