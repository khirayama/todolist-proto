import { useTranslation } from "react-i18next";
import { createContext, useContext, ReactNode, useState } from "react";
import { deepmerge } from "@fastify/deepmerge";

function replaceByClonedSource<T = any>(options: { clone: (source: T) => T }) {
  return (_: T, source: T) => options.clone(source);
}

const merge = deepmerge({ mergeArray: replaceByClonedSource });

type GlobalState = State;

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

const config = {
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

  const setGlobalState = (newState: DeepPartial<GlobalState>) => {
    changeLanguage();
    const mergedState = merge(snapshot, newState) as GlobalState;
    snapshot = mergedState;
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
  (newState: DeepPartial<GlobalState>) => void,
  () => GlobalState,
] => {
  return useContext(GlobalStateContext);
};
